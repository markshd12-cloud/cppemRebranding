"use client";

import Link from "next/link";
import { geoMercator, geoPath } from "d3-geo";
import { useMemo, useState } from "react";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import { ibgeCodeToState, northeastStates, stateNames, statusLabels } from "@/lib/constants";
import type { Contest } from "@/types/content";

export type StateFeature = Feature<Geometry, { codarea: string }>;

type BrazilMapProps = {
  contests: Contest[];
  features: StateFeature[];
  compact?: boolean;
  selectedState?: string;
  showCompactSummary?: boolean;
  onSelectState?: (state: string) => void;
};

export function BrazilMap({ contests, features, compact = false, selectedState, showCompactSummary = true, onSelectState }: BrazilMapProps) {
  const [internalSelected, setInternalSelected] = useState("PE");
  const selected = selectedState ?? internalSelected;
  const selectState = (state: string) => {
    setInternalSelected(state);
    onSelectState?.(state);
  };

  const projection = useMemo(() => {
    if (!features.length) return null;
    return geoMercator().fitExtent([[35,25],[565,540]], { type:"FeatureCollection", features } as FeatureCollection);
  }, [features]);
  const path = useMemo(() => projection ? geoPath(projection) : null, [projection]);
  const stateContests = contests.filter((contest) => contest.states.includes(selected));
  const statesWithData = new Set(contests.flatMap((contest) => contest.states));
  // o Nordeste fica sempre clicavel; fora dele, o estado acende quando ganha um concurso publicado no Notion
  const activeStates = new Set<string>([...northeastStates, ...statesWithData]);

  const map = <div className="map-frame">
    {features.length === 0 ? <div className="state-panel">Mapa temporariamente indisponível.</div> : <svg className="map-svg" viewBox="0 0 600 570" role="img" aria-label="Mapa do Brasil com os estados que têm concursos acompanhados">
      {features.map((feature) => {
        const state = ibgeCodeToState[feature.properties.codarea];
        const active = activeStates.has(state);
        const d = path?.(feature) ?? undefined;
        if (!state || !d) return null;
        // servidor e navegador divergem no ultimo digito do centroide e o React
        // acusa erro de hidratacao: duas casas ja posicionam o rotulo
        const [cxBruto, cyBruto] = path!.centroid(feature);
        const cx = Math.round(cxBruto * 100) / 100;
        const cy = Math.round(cyBruto * 100) / 100;
        return <g key={state}>
          <path d={d} className={`map-state ${active ? "map-state-active" : ""} ${selected === state ? "map-state-selected" : ""}`} role={active ? "button" : undefined} tabIndex={active ? 0 : undefined} aria-label={active ? `${stateNames[state]}, selecionar estado` : `${stateNames[state]}, expansão futura`} aria-pressed={active ? selected === state : undefined} onClick={() => active && selectState(state)} onKeyDown={(event) => { if (active && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); selectState(state); } }}><title>{stateNames[state]}</title></path>
          {active && <text x={cx} y={cy + 3} textAnchor="middle" fill={selected === state ? "#0a0a0b" : "#f0dcb0"} fontSize="9" fontWeight="700" pointerEvents="none">{state}</text>}
          {statesWithData.has(state) && active && <circle className="map-pulse" cx={cx} cy={cy} r="3"/>}
        </g>;
      })}
    </svg>}
    {compact && showCompactSummary && <div className="state-panel" style={{position:"absolute",left:"1rem",right:"1rem",bottom:"1rem"}}><strong>{stateNames[selected]}</strong><span className="map-hint" style={{marginLeft:8}}>{stateContests.length ? `${stateContests.length} concurso(s) acompanhado(s)` : "Nenhum concurso publicado no momento"}</span></div>}
  </div>;

  if (compact) return map;
  return <div className="contest-layout">{map}<aside className="contest-list-panel" aria-live="polite">
    <span className="product-category">Estado selecionado</span><h2 className="product-name">{stateNames[selected]}</h2><p className="map-hint">{stateContests.length ? `${stateContests.length} oportunidade(s) acompanhada(s).` : "Ainda não há concursos publicados para este estado."}</p>
    {stateContests.slice(0,4).map((contest) => <Link className="mini-contest" href={`/concursos/${contest.slug}`} key={contest.id}><span className="product-category">{statusLabels[contest.status]}</span><strong style={{display:"block",marginTop:4}}>{contest.acronym} — {contest.title}</strong><span className="map-hint">{contest.openings} • {contest.examBoard}</span></Link>)}
    <div style={{display:"grid",gap:10,marginTop:18}}><Link className="gold-button" href={`/concursos/lista?estado=${selected}`}>Ver concursos de {selected}</Link><Link className="ghost-button" href="/concursos/lista">Ver biblioteca completa</Link></div>
  </aside></div>;
}
