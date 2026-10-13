"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { PIXELX_CONTACT, trackWhatsapp } from "@/lib/tracking";

// link de atendimento (redireciona para o WhatsApp da equipe, que responde 24h)
const LINK = "https://links.cppem.com.br/contato-cppem-ass";

const CHAMADAS = [
  { titulo: "Atendimento 24h", texto: "Madrugada, fim de semana ou feriado: a equipe CPPEM responde a qualquer hora." },
  { titulo: "Ficou com dúvida?", texto: "Chama no WhatsApp agora. Tem gente do CPPEM online 24h por dia." },
  { titulo: "Não sabe qual escolher?", texto: "A gente indica a preparação certa para o seu concurso, a qualquer hora." },
  { titulo: "Dúvida no pagamento?", texto: "Parcelamento, PIX e acesso: atendimento 24h, todos os dias." },
];

const CHAVE = "cppem-zap-fechado";
const ESPERA_INICIAL = 9000;
const TEMPO_ABERTO = 13000;
const INTERVALO = 26000;

export function WhatsappFloat() {
  const rota = usePathname();
  const [indice, setIndice] = useState(0);
  const [aberto, setAberto] = useState(false);
  const ativo = useRef(true);

  useEffect(() => {
    // quem ja fechou o aviso nesta visita nao recebe de novo
    try { ativo.current = sessionStorage.getItem(CHAVE) !== "1"; } catch { ativo.current = true; }
    if (!ativo.current) return;

    let fechar: number;
    const abrir = () => {
      if (!ativo.current) return;
      setAberto(true);
      fechar = window.setTimeout(() => setAberto(false), TEMPO_ABERTO);
    };
    const primeiro = window.setTimeout(abrir, ESPERA_INICIAL);
    const ciclo = window.setInterval(() => {
      if (!ativo.current) return;
      setIndice((valor) => (valor + 1) % CHAMADAS.length);
      abrir();
    }, INTERVALO);
    return () => {
      window.clearTimeout(primeiro);
      window.clearTimeout(fechar);
      window.clearInterval(ciclo);
    };
  }, []);

  // o painel administrativo nao e vitrine: ali o botao so atrapalha
  if (rota.startsWith("/admin")) return null;

  const chamada = CHAMADAS[indice];
  const encerrar = () => {
    setAberto(false);
    ativo.current = false;
    try { sessionStorage.setItem(CHAVE, "1"); } catch {}
  };

  return <div className="zap-float">
    <div className="zap-bubble" data-open={aberto} aria-hidden={!aberto}>
      <button className="zap-bubble-close" type="button" aria-label="Fechar aviso" onClick={encerrar} tabIndex={aberto ? undefined : -1}><X size={13} /></button>
      <strong>{chamada.titulo}</strong>
      <p>{chamada.texto}</p>
      <a className={PIXELX_CONTACT} href={LINK} target="_blank" rel="noreferrer" tabIndex={aberto ? undefined : -1} onClick={() => trackWhatsapp("whatsapp_balao")}>Falar agora · 24h</a>
    </div>

    <a className={`zap-button ${PIXELX_CONTACT}`} href={LINK} target="_blank" rel="noreferrer" aria-label="Atendimento 24h do CPPEM no WhatsApp" onClick={() => trackWhatsapp("whatsapp_fab")}>
      <span className="zap-ping" aria-hidden="true" />
      <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true" focusable="false">
        <path fill="currentColor" d="M16.05 3.2c-7.05 0-12.78 5.72-12.78 12.77 0 2.25.59 4.45 1.71 6.39L3.2 28.8l6.6-1.73a12.73 12.73 0 0 0 6.25 1.6h.01c7.04 0 12.77-5.73 12.77-12.78 0-3.41-1.33-6.62-3.74-9.03a12.68 12.68 0 0 0-9.04-3.66Zm0 23.31h-.01a10.6 10.6 0 0 1-5.4-1.48l-.39-.23-4.02 1.05 1.07-3.92-.25-.4a10.57 10.57 0 0 1-1.62-5.66c0-5.86 4.77-10.62 10.63-10.62 2.84 0 5.5 1.11 7.51 3.12a10.55 10.55 0 0 1 3.11 7.51c0 5.86-4.77 10.63-10.63 10.63Zm5.83-7.96c-.32-.16-1.89-.93-2.18-1.04-.29-.11-.5-.16-.71.16-.21.32-.82 1.04-1 1.25-.19.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.59-.95-.85-1.59-1.89-1.78-2.21-.19-.32-.02-.5.14-.66.14-.14.32-.37.48-.56.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.71-1.73-.98-2.36-.26-.62-.52-.54-.71-.55l-.61-.01c-.21 0-.56.08-.85.4-.29.32-1.11 1.09-1.11 2.65 0 1.57 1.14 3.08 1.3 3.29.16.21 2.25 3.44 5.45 4.82.76.33 1.36.53 1.82.68.77.24 1.46.21 2.01.13.61-.09 1.89-.77 2.15-1.52.27-.74.27-1.38.19-1.51-.08-.13-.29-.21-.61-.37Z" />
      </svg>
    </a>
  </div>;
}
