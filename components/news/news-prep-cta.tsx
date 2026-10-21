/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { getCourseProducts } from "@/lib/data";
import type { CourseProduct } from "@/types/content";

// "PM-PE", "PM PE" e "PMPE" sao a mesma sigla: junta antes de comparar
function normalizeAcronyms(text: string) {
  return text.toUpperCase().replace(/\b(PM|PC|PP|CBM|GCM|GM|BM|PRF|PF|PL)[\s-]+([A-Z]{2})\b/g, "$1$2");
}

// prioriza curso/preparacao completa e o que ja esta em destaque no menu
function rank(course: CourseProduct) {
  const type = `${course.type} ${course.category}`.toLowerCase();
  return (/curso|prepara|mentoria|turma/.test(type) ? 0 : 2) + (course.menuFeatured ? 0 : 1);
}

export function matchCourses(text: string, courses: CourseProduct[]) {
  const haystack = normalizeAcronyms(text);
  const seen = new Set<string>();
  return courses
    .filter((course) => {
      const acronym = normalizeAcronyms(course.acronym?.trim() ?? "");
      if (acronym.length < 2) return false;
      const escaped = acronym.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp(`(^|[^A-Z0-9])${escaped}([^A-Z0-9]|$)`).test(haystack);
    })
    .sort((a, b) => rank(a) - rank(b))
    .filter((course) => !seen.has(course.href) && Boolean(seen.add(course.href)))
    .slice(0, 2);
}

/** CTA do fim de cada post: preparacao do concurso citado ou, sem match, o caminho geral. */
export async function NewsPrepCta({ text }: { text: string }) {
  const courses = matchCourses(text, await getCourseProducts().catch(() => []));
  const main = courses[0];

  if (!main) {
    return <aside className="news-prep-cta" aria-label="Preparação CPPEM">
      <div className="news-prep-cta-copy">
        <span className="eyebrow"><ShieldCheck size={15} /> Sua aprovação começa antes do edital</span>
        <h2>Comece a sua preparação com o CPPEM</h2>
        <p>Cronograma, material e acompanhamento para carreiras policiais. Quem estuda com método chega à prova pronto.</p>
        <div className="news-prep-cta-actions">
          <Link className="gold-button" href="/plano-de-combate">Montar meu plano de combate <ArrowRight size={17} /></Link>
          <Link className="ghost-button" href="/produtos">Ver preparações</Link>
        </div>
      </div>
    </aside>;
  }

  const external = /^https?:\/\//.test(main.href);
  return <aside className="news-prep-cta" aria-label={`Preparação para ${main.acronym}`}>
    {main.imageUrl && <img className="news-prep-cta-image" src={main.imageUrl} alt={main.name} loading="lazy" />}
    <div className="news-prep-cta-copy">
      <span className="eyebrow"><ShieldCheck size={15} /> Preparação {main.acronym}</span>
      <h2>Vai prestar {main.acronym}? Prepare-se com o CPPEM</h2>
      <p>{main.description || `${main.name}: conteúdo direcionado ao edital, com método e acompanhamento até a prova.`}</p>
      <div className="news-prep-cta-actions">
        {external
          ? <a className="gold-button" href={main.href} target="_blank" rel="noopener noreferrer">Quero me preparar para {main.acronym} <ArrowRight size={17} /></a>
          : <Link className="gold-button" href={main.href}>Quero me preparar para {main.acronym} <ArrowRight size={17} /></Link>}
        {courses[1] && <a className="ghost-button" href={courses[1].href} target={/^https?:/.test(courses[1].href) ? "_blank" : undefined} rel="noopener noreferrer">{courses[1].name}</a>}
      </div>
    </div>
  </aside>;
}
