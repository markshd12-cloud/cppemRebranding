import type { Metadata } from "next";
import Link from "next/link";
import { BrazilMapServer } from "@/components/contests/brazil-map-server";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { StudentProof } from "@/components/home/student-proof";
import { getContests } from "@/lib/data";
import { approvedStudentImages } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Mapa de concursos", description: "Explore concursos policiais por estado e encontre informações verificadas e preparações do CPPEM.", alternates: { canonical: "/concursos" } };

export default async function ContestsPage() {
  const contests = await getContests();
  const lastVerified = contests.map((item) => item.lastVerifiedAt).sort().at(-1);
  return <div className="page-shell"><SiteHeader/><main>
    <section className="contest-hero"><div className="container"><div className="section-heading"><span className="eyebrow" style={{justifyContent:"center"}}>Mapa de concursos CPPEM</span><h1 className="display-title">Escolha seu estado e trace a <span className="gold">rota da aprovação.</span></h1><p className="section-copy">Concursos policiais acompanhados estado a estado, com informações editoriais verificadas e conexão direta com as preparações disponíveis no CPPEM.</p><div style={{display:"flex",justifyContent:"center",gap:10,flexWrap:"wrap",marginTop:24}}><a className="gold-button" href="#mapa">Explorar mapa</a><Link className="ghost-button" href="/concursos/lista">Ver biblioteca completa</Link></div>{lastVerified && <p className="map-hint" style={{marginTop:18}}>Última verificação do catálogo: {formatDate(lastVerified)}</p>}</div>
      <div className="contest-guide"><div className="guide-item"><span className="guide-number">01</span>Selecione um dos estados destacados no mapa.</div><div className="guide-item"><span className="guide-number">02</span>Veja concursos publicados, autorizados ou previstos.</div><div className="guide-item"><span className="guide-number">03</span>Abra os detalhes e encontre a preparação relacionada.</div></div>
    </div></section>
    <section className="section" id="mapa"><div className="container"><BrazilMapServer contests={contests}/></div></section>
    <section className="section section-alt"><div className="container"><div className="section-heading"><span className="eyebrow">Resultados reais</span><h2 className="display-title">Preparação que vira <span className="gold">conquista.</span></h2></div></div><StudentProof images={approvedStudentImages}/><div className="container" style={{textAlign:"center",marginTop:30}}><Link className="gold-button" href="/concursos/lista">Ver todos os concursos</Link></div></section>
  </main><SiteFooter/></div>;
}
