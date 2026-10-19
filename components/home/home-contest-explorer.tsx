"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";
import { BrazilMap, type StateFeature } from "@/components/contests/brazil-map";
import { stateNames, statusLabels } from "@/lib/constants";
import type { Contest } from "@/types/content";

export function HomeContestExplorer({ contests, features }: { contests: Contest[]; features: StateFeature[] }) {
  const [selected, setSelected] = useState("PE");
  const [open, setOpen] = useState(false);
  const stateContests = contests.filter((contest) => contest.states.includes(selected));
  const relatedProducts = Array.from(new Map(stateContests.flatMap((contest) => contest.products ?? (contest.product ? [contest.product] : [])).map((product) => [product.id, product])).values()).slice(0, 3);

  const selectState = (state: string) => {
    setSelected(state);
    setOpen(true);
  };

  return <div className="home-map-explorer" data-open={open}>
    <div className="home-map-intro" aria-hidden={open || undefined}>
      <span className="eyebrow">Concursos por estado</span>
      <h2 className="display-title">Encontre oportunidades no <span className="gold">seu estado.</span></h2>
      <p className="section-copy">Acompanhe concursos policiais abertos e previstos pelo Brasil. Selecione um estado no mapa e veja as oportunidades e preparações relacionadas.</p>
      <div className="home-map-actions"><Link className="gold-button" href="/concursos" tabIndex={open ? -1 : undefined}>Explorar o mapa completo</Link><Link className="ghost-button" href="/concursos/lista" tabIndex={open ? -1 : undefined}>Ver todos os concursos</Link></div>
    </div>

    <div className="home-map-motion">
      <BrazilMap contests={contests} features={features} compact selectedState={selected} showCompactSummary={false} onSelectState={selectState}/>
    </div>

    <aside className="home-map-results" aria-hidden={!open} aria-live="polite">
      {open && <>
        <button className="home-map-back" type="button" onClick={() => setOpen(false)}><ArrowLeft size={17}/> Voltar</button>
        <h3 className="home-map-state-title">{stateNames[selected]}</h3>
        <p className="map-hint">{stateContests.length ? `${stateContests.length} oportunidade(s) acompanhada(s).` : "Ainda não há concursos publicados para este estado."}</p>

        <div className="home-state-contests">
          {stateContests.slice(0, 3).map((contest) => <article className="home-state-card" key={contest.id}>
            <span className="product-category">{statusLabels[contest.status]}</span>
            <h4>{contest.acronym} — {contest.title}</h4>
            <p>{contest.openings} • {contest.examBoard}</p>
            <Link className="home-state-link" href={`/concursos/${contest.slug}`}>Ver detalhes do concurso<ArrowRight size={15}/></Link>
          </article>)}
          {!stateContests.length && <div className="home-state-empty">Estamos expandindo o catálogo. Você ainda pode consultar todas as oportunidades acompanhadas pelo CPPEM.</div>}
        </div>

        {relatedProducts.length > 0 && <div className="home-state-preparations">
          <span className="product-category">Preparações disponíveis</span>
          {relatedProducts.map((product) => <Link className="home-preparation-card" href={product.href} key={product.id}>
            <span><strong>{product.name}</strong>{product.price && <small>{product.price}</small>}</span><ArrowRight size={17}/>
          </Link>)}
        </div>}

        <Link className="gold-button home-map-list-cta" href={`/concursos/lista?estado=${selected}`}>Ver concursos de {selected}</Link>
      </>}
    </aside>
  </div>;
}
