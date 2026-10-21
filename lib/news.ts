import "server-only";
import { unstable_cache } from "next/cache";
import { createSupabasePublicClient } from "@/lib/supabase/public";

const NEWS_TABLE = "noticias";
const FALLBACK_IMAGE = "/images/noticias/cppem-news.webp";
export const NEWS_PAGE_SIZE = 14;

type RawNewsRow = Record<string, unknown>;

export type NewsArticle = {
  id: string;
  routeKey: string;
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  linkUrl: string | null;
  isExternal: boolean;
  publishedAt: string | null;
  readingMinutes: number;
};

export type NewsFeed = {
  articles: NewsArticle[];
  total: number;
  page: number;
  pageSize: number;
  query: string;
  errorMessage: string | null;
};

function pickString(row: RawNewsRow, ...keys: string[]) {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function stripMarkup(value: string) {
  return decodeEntities(value
    .replace(/<[^>]*>/g, " "))
    .replace(/[#*_>`~\[\]()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", ndash: "–", mdash: "—", hellip: "…", laquo: "«", raquo: "»" };

function decodeEntities(value: string) {
  return value.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code: string) => {
    if (code[0] === "#") {
      const n = code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : match;
    }
    return ENTITIES[code.toLowerCase()] ?? match;
  });
}

/**
 * O agregador grava o corpo em HTML (posts antigos), Markdown (posts novos) ou
 * texto puro. Tudo vira Markdown, que o site renderiza sem HTML cru: assim os
 * subtitulos saem como H2/H3 de verdade e nada de fora executa na pagina.
 * O H1 e o titulo da pagina, entao qualquer H1 vindo do corpo desce para H2.
 */
export function toArticleMarkdown(content: string) {
  if (!content) return "";
  let md = content.replace(/\r\n?/g, "\n");
  if (/<\/?(p|h[1-6]|ul|ol|li|strong|b|em|i|a|br|blockquote|div|span)\b/i.test(md)) {
    md = md
      .replace(/<(script|style|iframe|noscript)[\s\S]*?<\/\1>/gi, "")
      .replace(/<h[12][^>]*>([\s\S]*?)<\/h[12]>/gi, "\n\n## $1\n\n")
      .replace(/<h[3-6][^>]*>([\s\S]*?)<\/h[3-6]>/gi, "\n\n### $1\n\n")
      .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "\n- $1")
      .replace(/<\/(ul|ol)>/gi, "\n\n")
      .replace(/<(strong|b)\b[^>]*>([\s\S]*?)<\/\1>/gi, "**$2**")
      .replace(/<(em|i)\b[^>]*>([\s\S]*?)<\/\1>/gi, "_$2_")
      .replace(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)")
      .replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, "\n\n> $1\n\n")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div)>/gi, "\n\n")
      .replace(/<[^>]+>/g, "");
    md = decodeEntities(md);
  }
  return md
    .replace(/^#\s+/gm, "## ")
    .replace(/^#{4,}\s+/gm, "### ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function makeExcerpt(content: string) {
  const plain = stripMarkup(content);
  if (!plain) return "Confira os detalhes desta notícia no CPPEM News.";
  return plain.length > 170 ? `${plain.slice(0, 167).trimEnd()}…` : plain;
}

/** Link para uma notícia do próprio CPPEM (cppem.com.br/noticias/...). */
function isOwnNewsUrl(url: string) {
  try {
    const { hostname, pathname } = new URL(url);
    return (hostname === "cppem.com.br" || hostname === "www.cppem.com.br") && pathname.startsWith("/noticias/");
  } catch {
    return false;
  }
}

function normalizeNewsRow(row: RawNewsRow): NewsArticle {
  const id = String(row.id ?? "");
  const title = pickString(row, "titulo", "title") ?? "Notícia CPPEM";
  const content = pickString(row, "corpo", "conteudo", "content") ?? "";
  const routeKey = pickString(row, "slug") ?? id;
  // A identidade editorial usa uma única capa institucional. A imagem recebida
  // pelo agregador permanece no banco para auditoria, mas não é exibida no site.
  const imageUrl = FALLBACK_IMAGE;
  // O n8n grava em `link` o endereço da própria notícia em cppem.com.br. Com o
  // site novo nesse domínio, isso deixa de ser "fonte externa": seria um botão
  // de fonte original apontando para a página em que o leitor já está.
  const linkBruto = pickString(row, "link", "url");
  const linkUrl = linkBruto && !isOwnNewsUrl(linkBruto) ? linkBruto : null;
  const publishedAt = pickString(row, "publicado_em", "published_at", "created_at");
  const words = stripMarkup(content).split(/\s+/).filter(Boolean).length;

  return {
    id,
    routeKey,
    title,
    excerpt: makeExcerpt(content),
    content,
    imageUrl,
    linkUrl,
    isExternal: Boolean(row.is_external && linkUrl),
    publishedAt,
    readingMinutes: Math.max(1, Math.ceil(words / 220)),
  };
}

function normalizeSearchTerms(query: string) {
  return query
    .split(/\s+/)
    .map((term) => term.trim().replace(/[%_,]/g, ""))
    .filter(Boolean)
    .slice(0, 6);
}

async function fetchLatestNews(limit: number) {
  const supabase = createSupabasePublicClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from(NEWS_TABLE)
    .select("*")
    .order("created_at", { ascending: false, nullsFirst: false })
    .limit(Math.max(1, Math.min(limit, 20)));

  if (error) {
    console.error("[noticias] Falha ao carregar últimas notícias:", error.message);
    return [];
  }

  return (data ?? []).map((row) => normalizeNewsRow(row as RawNewsRow));
}

export const getLatestNews = unstable_cache(fetchLatestNews, ["cppem-latest-news"], {
  revalidate: 300,
  tags: ["noticias"],
});

export async function getNewsFeed({
  query = "",
  page = 1,
  pageSize = NEWS_PAGE_SIZE,
}: {
  query?: string;
  page?: number;
  pageSize?: number;
} = {}): Promise<NewsFeed> {
  const cleanQuery = query.trim();
  const currentPage = Math.max(1, page);
  const safePageSize = Math.max(1, Math.min(pageSize, 24));
  const supabase = createSupabasePublicClient();

  if (!supabase) {
    return { articles: [], total: 0, page: currentPage, pageSize: safePageSize, query: cleanQuery, errorMessage: "A fonte de notícias ainda não está configurada." };
  }

  let request = supabase
    .from(NEWS_TABLE)
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false, nullsFirst: false });

  for (const term of normalizeSearchTerms(cleanQuery)) {
    const token = `%${term}%`;
    request = request.or(`titulo.ilike.${token},corpo.ilike.${token},slug.ilike.${token}`);
  }

  const from = (currentPage - 1) * safePageSize;
  const { data, error, count } = await request.range(from, from + safePageSize - 1);

  if (error) {
    console.error("[noticias] Falha ao carregar listagem:", error.message);
    return { articles: [], total: 0, page: currentPage, pageSize: safePageSize, query: cleanQuery, errorMessage: "Não foi possível carregar as notícias agora. Tente novamente em instantes." };
  }

  return {
    articles: (data ?? []).map((row) => normalizeNewsRow(row as RawNewsRow)),
    total: count ?? 0,
    page: currentPage,
    pageSize: safePageSize,
    query: cleanQuery,
    errorMessage: null,
  };
}

export async function getNewsArticle(routeKey: string) {
  const supabase = createSupabasePublicClient();
  if (!supabase) return null;

  const bySlug = await supabase.from(NEWS_TABLE).select("*").eq("slug", routeKey).limit(1).maybeSingle();
  if (bySlug.data) return normalizeNewsRow(bySlug.data as RawNewsRow);

  const byId = await supabase.from(NEWS_TABLE).select("*").eq("id", routeKey).limit(1).maybeSingle();
  return byId.data ? normalizeNewsRow(byId.data as RawNewsRow) : null;
}

export async function getNewsSitemapEntries() {
  const supabase = createSupabasePublicClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from(NEWS_TABLE)
    .select("id,slug,created_at,is_external,link")
    .order("created_at", { ascending: false })
    .limit(5000);

  if (error) return [];
  // o agregador marca tudo como is_external, mas grava em `link` a propria
  // pagina do CPPEM: so fica fora do sitemap o que realmente aponta para fora
  return (data ?? []).filter((row) => !(row.is_external && row.link && !isOwnNewsUrl(String(row.link)))).map((row) => ({
    routeKey: String(row.slug || row.id),
    lastModified: row.created_at ? new Date(row.created_at) : undefined,
  }));
}

export function newsHref(article: NewsArticle) {
  return article.isExternal && article.linkUrl ? article.linkUrl : `/noticias/${encodeURIComponent(article.routeKey)}`;
}

export function formatNewsDate(value: string | null, long = false) {
  if (!value) return "Data não informada";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Data não informada";
  return new Intl.DateTimeFormat("pt-BR", long
    ? { day: "2-digit", month: "long", year: "numeric", timeZone: "America/Fortaleza" }
    : { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "America/Fortaleza" }
  ).format(date);
}

export function splitNewsContent(content: string) {
  return content.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean);
}
