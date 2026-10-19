import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ContestCard } from "@/components/contests/contest-card";
import { ContestFilters } from "@/components/contests/contest-filters";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getContests } from "@/lib/data";
import { filterContests } from "@/lib/utils";

export const metadata: Metadata = { title: "Lista de concursos", description: "Consulte concursos policiais por estado, carreira, status e abrangência.", alternates: { canonical: "/concursos/lista" } };

type Search = { q?: string; estado?: string; status?: string; carreira?: string; abrangencia?: string; pagina?: string };

export default async function ContestLibraryPage({ searchParams }: { searchParams: Promise<Search> }) {
  const [params,all] = await Promise.all([searchParams,getContests()]);
  const filtered = filterContests(all,{ q:params.q,state:params.estado,status:params.status,career:params.carreira,scope:params.abrangencia });
  const page = Math.max(1,Number(params.pagina) || 1); const perPage = 12; const pages = Math.max(1,Math.ceil(filtered.length/perPage)); const items = filtered.slice((page-1)*perPage,page*perPage);
  const careers = [...new Set(all.map((item) => item.career))].sort();
  const states = [...new Set(all.flatMap((item) => item.states))];
  return <div className="page-shell"><SiteHeader/><main><section className="contest-hero" style={{paddingBottom:"2.8rem"}}><div className="container"><div className="section-heading"><span className="eyebrow" style={{justifyContent:"center"}}>Biblioteca CPPEM</span><h1 className="display-title">Concursos <span className="gold">policiais.</span></h1><p className="section-copy">Filtre oportunidades e consulte cada informação na fonte oficial.</p></div></div></section>
    <section className="library-shell"><div className="container"><Suspense fallback={null}><ContestFilters careers={careers} states={states}/></Suspense><p className="map-hint">{filtered.length} concurso(s) encontrado(s)</p>
      {items.length ? <div className="contest-cards" style={{marginTop:16}}>{items.map((contest) => <ContestCard contest={contest} key={contest.id}/>)}</div> : <div className="detail-panel" style={{textAlign:"center",padding:"3rem",marginTop:16}}><h2>Nenhum concurso encontrado</h2><p className="section-copy">Tente remover alguns filtros ou acompanhe a biblioteca completa.</p><Link className="gold-button" href="/concursos/lista">Limpar filtros</Link></div>}
      {pages > 1 && <nav aria-label="Paginação" style={{display:"flex",justifyContent:"center",gap:8,marginTop:30}}>{Array.from({length:pages},(_,index) => { const n=index+1; const query=new URLSearchParams(Object.entries(params).filter(([key,value]) => key !== "pagina" && value).map(([key,value]) => [key,String(value)])); if(n>1)query.set("pagina",String(n)); return <Link className={n===page?"gold-button":"ghost-button"} href={`/concursos/lista?${query}`} key={n}>{n}</Link>; })}</nav>}
    </div></section></main><SiteFooter/></div>;
}
