/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, CalendarDays, Clock3, MapPin, MonitorPlay, Ticket, Users } from "lucide-react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { formatEventDate } from "@/lib/events";
import { getEvents } from "@/lib/notion/events";
import type { EventItem } from "@/types/events";
import "./eventos.css";

export const metadata: Metadata = {
  title: "Eventos",
  description: "Aulões, madrugadas de estudo e encontros presenciais e ao vivo do CPPEM para concursos policiais. Veja a agenda e garanta sua vaga.",
  alternates: { canonical: "/eventos" },
};

// o texto do botao acompanha o momento do evento
const ctaByStatus: Record<string, string> = {
  "Inscrições abertas": "Garantir minha vaga",
  "Ao vivo": "Assistir agora",
  "Em breve": "Quero ser avisado",
  "Lista de espera": "Entrar na lista",
  Encerrado: "Ver como foi",
};

function EventLink({ event, className, children }: { event: EventItem; className: string; children: React.ReactNode }) {
  const external = !event.href.startsWith("/");
  return <Link className={className} href={event.href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}>{children}</Link>;
}

// "Domingo, 18 de outubro": meio-dia evita virar o dia por causa do fuso
function longDate(date: string) {
  const texto = new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function EventMeta({ event }: { event: EventItem }) {
  return <ul className="events-meta">
    {event.date && <li className="events-meta-date"><CalendarDays size={15} /> {longDate(event.date)}</li>}
    {event.time && <li><Clock3 size={15} /> {event.time}</li>}
    {event.place && <li><MapPin size={15} /> {event.place}</li>}
    {event.format && <li>{event.format === "Online" ? <MonitorPlay size={15} /> : <Users size={15} />} {event.format}</li>}
    {event.price && <li><Ticket size={15} /> {event.price}</li>}
  </ul>;
}

export default async function EventosPage() {
  const events = await getEvents();
  // sem evento em destaque: a agenda completa mostra todos
  const rest = events;
  const upcoming = events.filter((event) => event.status !== "Encerrado").length;

  return <div className="page-shell events-page"><SiteHeader /><main>

    {/* SECAO 1 - Topo */}
    <section className="events-hero"><div className="container events-hero-inner">
      <span className="eyebrow">Agenda CPPEM</span>
      <h1>Eventos que <span>aproximam</span> você da farda.</h1>
      <p>Aulões presenciais, madrugadas de estudo e encontros ao vivo com o time CPPEM. Escolha o seu e garanta a vaga antes que lote.</p>
      <div className="events-hero-stats">
        <span><strong>{upcoming}</strong> {upcoming === 1 ? "evento na agenda" : "eventos na agenda"}</span>
        <span className="events-live-chip"><span className="nav-events-dot" aria-hidden="true" /> Vagas limitadas</span>
      </div>
    </div></section>

    {/* SECAO 3 - Agenda completa */}
    {rest.length > 0 && <section className="events-list-section"><div className="container">
      <div className="presencial-centered-heading"><span className="eyebrow">Agenda completa</span><h2 className="display-title">Mais <span className="gold">eventos.</span></h2></div>
      <div className="events-grid">{rest.map((event) => {
        const date = formatEventDate(event.date);
        return <article className="events-card" data-status={event.status} key={event.id}>
          <EventLink event={event} className="events-card-media">
            {event.imageUrl ? <img src={event.imageUrl} alt={`Divulgação: ${event.name}`} loading="lazy" /> : <Image src="/brand/emblema-leao.webp" alt="" width={120} height={120} />}
            {date && <span className="events-date-badge"><strong>{date.day}</strong>{date.month}</span>}
          </EventLink>
          <div className="events-card-body">
            <div className="events-tags"><span className="events-status" data-status={event.status}>{event.status}</span>{event.label && <span className="events-label">{event.label}</span>}</div>
            <h3>{event.name}</h3>
            {event.description && <p>{event.description}</p>}
            <EventMeta event={event} />
            <EventLink event={event} className="events-card-cta">{ctaByStatus[event.status] ?? "Ver evento"} <ArrowUpRight size={16} /></EventLink>
          </div>
        </article>;
      })}</div>
    </div></section>}

    {/* Sem eventos cadastrados/ativos no Notion */}
    {events.length === 0 && <section className="events-list-section"><div className="container events-empty">
      <Image src="/brand/emblema-leao.webp" alt="" width={90} height={90} />
      <h2>A próxima agenda está sendo preparada.</h2>
      <p>Entre no QG CPPEM e seja avisado assim que as inscrições abrirem.</p>
      <Link className="gold-button" href="/qg">Entrar no QG <ArrowRight size={18} /></Link>
    </div></section>}

    {/* SECAO 4 - Ser avisado dos proximos (leva ao QG) */}
    {events.length > 0 && <section className="events-qg-section"><div className="container events-qg">
      <div><span className="eyebrow">Não perca o próximo</span><h2 className="display-title">Seja avisado <span className="gold">primeiro.</span></h2><p>Os eventos do CPPEM lotam rápido. No QG, a comunidade gratuita no WhatsApp, você fica sabendo antes de abrir para todo mundo.</p></div>
      <Link className="gold-button" href="/qg">Entrar no QG CPPEM <ArrowRight size={18} /></Link>
    </div></section>}

  </main><SiteFooter /></div>;
}
