"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { northeastStates, stateNames, statusLabels } from "@/lib/constants";
import { contestStatuses } from "@/types/content";

export function ContestFilters({ careers, states = [] }: { careers: string[]; states?: string[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const update = useCallback((key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key,value);
    else next.delete(key);
    next.delete("pagina");
    router.push(`/concursos/lista${next.size ? `?${next}` : ""}`);
  },[params,router]);
  return <div className="filters" aria-label="Filtros de concursos">
    <label style={{position:"relative"}}><span className="sr-only">Buscar concurso</span><Search size={17} aria-hidden style={{position:"absolute",left:13,top:15,color:"var(--text-muted)"}}/><input className="field" style={{paddingLeft:40}} defaultValue={params.get("q") ?? ""} placeholder="Nome, órgão, sigla ou cargo" onKeyDown={(event) => { if (event.key === "Enter") update("q",event.currentTarget.value); }}/></label>
    <FilterSelect label="Estado" value={params.get("estado") ?? ""} onChange={(value) => update("estado",value)} options={[...new Set([...northeastStates, ...states])].sort((a, b) => (stateNames[a] ?? a).localeCompare(stateNames[b] ?? b, "pt-BR")).map((state) => [state,stateNames[state] ?? state])}/>
    <FilterSelect label="Status" value={params.get("status") ?? ""} onChange={(value) => update("status",value)} options={contestStatuses.map((status) => [status,statusLabels[status]])}/>
    <FilterSelect label="Carreira" value={params.get("carreira") ?? ""} onChange={(value) => update("carreira",value)} options={careers.map((career) => [career,career])}/>
    <FilterSelect label="Abrangência" value={params.get("abrangencia") ?? ""} onChange={(value) => update("abrangencia",value)} options={[["estadual","Estadual"],["federal","Federal"],["nacional","Nacional"]]}/>
    <button className="ghost-button" type="button" onClick={() => router.push("/concursos/lista")}>Limpar</button>
  </div>;
}

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: readonly (readonly string[])[]; onChange: (value: string) => void }) {
  return <label><span className="sr-only">{label}</span><select className="field" value={value} onChange={(event) => onChange(event.target.value)}><option value="">{label}</option>{options.map(([key,text]) => <option value={key} key={key}>{text}</option>)}</select></label>;
}
