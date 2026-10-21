/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, ArrowRight, CalendarDays, Clock3, ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { NewsPrepCta } from "@/components/news/news-prep-cta";
import { siteUrl } from "@/lib/constants";
import { formatNewsDate, getLatestNews, getNewsArticle, newsHref, toArticleMarkdown } from "@/lib/news";

type PageProps = { params: Promise<{ slug: string }> };
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getNewsArticle(decodeURIComponent(slug));
  if (!article) return { title: "Notícia não encontrada" };
  const path = `/noticias/${encodeURIComponent(article.routeKey)}`;
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: path },
    openGraph: { title: article.title, description: article.excerpt, type: "article", url: path, publishedTime: article.publishedAt ?? undefined, section: "Concursos policiais", images: [article.imageUrl] },
    twitter: { card: "summary_large_image", title: article.title, description: article.excerpt },
  };
}

// links do corpo: os do proprio site seguem na mesma aba; os de fora abrem em
// outra aba e nao passam autoridade (o agregador pode trazer links de terceiros)
function MarkdownLink({ href = "", children }: { href?: string; children?: React.ReactNode }) {
  const own = href.startsWith("/") || href.startsWith(siteUrl);
  return own ? <Link href={href.replace(siteUrl, "") || "/"}>{children}</Link> : <a href={href} target="_blank" rel="noopener noreferrer nofollow">{children}</a>;
}

export default async function NewsArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getNewsArticle(decodeURIComponent(slug));
  if (!article) notFound();
  const markdown = toArticleMarkdown(article.content);
  const related = (await getLatestNews(5)).filter((item) => item.id !== article.id).slice(0, 3);
  const url = `${siteUrl}/noticias/${encodeURIComponent(article.routeKey)}`;

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      headline: article.title.slice(0, 110),
      description: article.excerpt,
      image: [`${siteUrl}${article.imageUrl}`],
      datePublished: article.publishedAt ?? undefined,
      dateModified: article.publishedAt ?? undefined,
      mainEntityOfPage: url,
      inLanguage: "pt-BR",
      author: { "@type": "Organization", name: "Redação CPPEM", url: siteUrl },
      publisher: { "@type": "Organization", name: "CPPEM Concursos", url: siteUrl, logo: { "@type": "ImageObject", url: `${siteUrl}/brand/logo-cppem.png` } },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Início", item: siteUrl },
        { "@type": "ListItem", position: 2, name: "Notícias", item: `${siteUrl}/noticias` },
        { "@type": "ListItem", position: 3, name: article.title, item: url },
      ],
    },
  ];

  return <div className="page-shell"><SiteHeader /><main>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
    <article className="news-detail"><div className="container news-detail-container">
      <nav aria-label="Você está em"><Link className="news-back" href="/noticias"><ArrowLeft size={16} /> Voltar para notícias</Link></nav>
      <header className="news-detail-header">
        <span className="eyebrow">CPPEM News</span>
        <h1>{article.title}</h1>
        <div className="news-detail-meta"><span><CalendarDays size={16} /><time dateTime={article.publishedAt ?? undefined}>{formatNewsDate(article.publishedAt, true)}</time></span><span><Clock3 size={16} />{article.readingMinutes} min de leitura</span></div>
        <p>{article.excerpt}</p>
      </header>
      <div className="news-detail-cover"><img src={article.imageUrl} alt={`CPPEM News: ${article.title}`} /></div>
      <div className="news-article-copy">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ h1: "h2", a: MarkdownLink, img: () => null }}>{markdown}</ReactMarkdown>
      </div>
      {article.linkUrl && <a className="ghost-button news-original-link" href={article.linkUrl} target="_blank" rel="noopener noreferrer nofollow">Consultar fonte original <ExternalLink size={15} /></a>}

      <NewsPrepCta text={`${article.title}\n${article.content}`} />

      {related.length > 0 && <section className="news-related" aria-labelledby="news-related-title">
        <h2 id="news-related-title">Leia também</h2>
        <ul>{related.map((item) => <li key={item.id}><Link href={newsHref(item)}><strong>{item.title}</strong><span>{formatNewsDate(item.publishedAt)} <ArrowRight size={14} /></span></Link></li>)}</ul>
      </section>}
    </div></article>
  </main><SiteFooter /></div>;
}
