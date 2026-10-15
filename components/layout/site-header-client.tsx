/* eslint-disable @next/next/no-img-element */
"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, CalendarDays, ChevronDown, ChevronLeft, ChevronRight, FileText, GraduationCap, MapPin, Menu, Package, Search, ShieldCheck, ShoppingBag, Sparkles, Target, University, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import { courseCategories } from "@/lib/course-categories";
import type { Product } from "@/types/content";
import type { FreeMaterial } from "@/types/free-content";
import type { EcosystemItem } from "@/types/ecosystem";
import type { EventItem } from "@/types/events";
import { formatEventDate } from "@/lib/events";

const primaryAfterCourses = [
  ["Concursos", "/concursos"], ["Notícias", "/noticias"], ["Parceiros", "/parceiros"], ["Indique", "https://indica.cppem.com.br"],
] as const;
const free = [
  { label: "Editais verticalizados", href: "/editais", description: "Transforme o conteúdo programático em uma rota clara de estudo.", icon: FileText },
  { label: "Materiais gratuitos", href: "/materiais-gratuitos", description: "Cadernos, questões e ferramentas para acelerar sua evolução.", icon: BookOpen },
] as const;

const ecosystemIcons = { Comunidade: Users, Alvo: Target, Graduação: GraduationCap, Diploma: University, Local: MapPin, Escudo: ShieldCheck, Loja: ShoppingBag, Estrela: Sparkles } as const;

// as colunas do menu repetem os grupos da vitrine para o aluno reconhecer o caminho
const storeColumns: Array<{ titulo: string; icon: typeof BookOpen; itens: Array<{ rotulo: string; tipo: string }> }> = [
  { titulo: "Preparação", icon: GraduationCap, itens: [
    { rotulo: "Cursos online", tipo: "Curso online" },
    { rotulo: "Cursos unificados", tipo: "Curso unificado" },
    { rotulo: "Disciplinas isoladas", tipo: "Curso isolado" },
    { rotulo: "Presencial", tipo: "Preparação presencial" },
    { rotulo: "Plano de Combate", tipo: "Plano de Combate" },
  ] },
  { titulo: "Material de estudo", icon: BookOpen, itens: [
    { rotulo: "Resumos bizurados", tipo: "Resumo bizurado" },
    { rotulo: "Cadernos de questões", tipo: "Caderno de questões" },
    { rotulo: "Vade mecum", tipo: "Vade mecum" },
    { rotulo: "E-books e ferramentas", tipo: "E-book e ferramentas" },
  ] },
  { titulo: "Leve tudo", icon: Package, itens: [
    { rotulo: "Combos", tipo: "Combo" },
    { rotulo: "Vestuário e acessórios", tipo: "Vestuário e acessórios" },
  ] },
];

export function SiteHeaderClient({ featuredCourses, featuredMaterials, ecosystemItems, storeCounts, storeTotal, events, eventsTotal }: { featuredCourses: Product[]; featuredMaterials: FreeMaterial[]; ecosystemItems: EcosystemItem[]; storeCounts: Record<string, number>; storeTotal: number; events: EventItem[]; eventsTotal: number }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileCoursesOpen, setMobileCoursesOpen] = useState(false);
  const [mobileFreeOpen, setMobileFreeOpen] = useState(false);
  const [mobileEcosystemOpen, setMobileEcosystemOpen] = useState(false);
  const [mobileEventsOpen, setMobileEventsOpen] = useState(false);
  const [coursesOpen, setCoursesOpen] = useState(false);
  const [freeOpen, setFreeOpen] = useState(false);
  const [ecosystemOpen, setEcosystemOpen] = useState(false);
  const [eventsOpen, setEventsOpen] = useState(false);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [featuredMaterialIndex, setFeaturedMaterialIndex] = useState(0);
  const featured = featuredCourses[featuredIndex];
  const featuredMaterial = featuredMaterials[featuredMaterialIndex];

  useEffect(() => {
    if ((!coursesOpen && !ecosystemOpen) || featuredCourses.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timeout = window.setTimeout(() => setFeaturedIndex((index) => (index + 1) % featuredCourses.length), 5500);
    return () => window.clearTimeout(timeout);
  }, [coursesOpen, ecosystemOpen, featuredCourses.length, featuredIndex]);

  useEffect(() => {
    if (!freeOpen || featuredMaterials.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timeout = window.setTimeout(() => setFeaturedMaterialIndex((index) => (index + 1) % featuredMaterials.length), 5500);
    return () => window.clearTimeout(timeout);
  }, [freeOpen, featuredMaterials.length, featuredMaterialIndex]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") { setCoursesOpen(false); setFreeOpen(false); setEcosystemOpen(false); setEventsOpen(false); } };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  const closeMobile = () => { setMobileOpen(false); setMobileCoursesOpen(false); setMobileFreeOpen(false); setMobileEcosystemOpen(false); setMobileEventsOpen(false); };
  const openCourses = () => {
    if (!coursesOpen) setFeaturedIndex(0);
    setFreeOpen(false);
    setEcosystemOpen(false);
    setEventsOpen(false);
    setCoursesOpen(true);
  };
  const openFree = () => {
    setCoursesOpen(false);
    setEcosystemOpen(false);
    setEventsOpen(false);
    if (!freeOpen) setFeaturedMaterialIndex(0);
    setFreeOpen(true);
  };
  const openEcosystem = () => {
    setCoursesOpen(false);
    setFreeOpen(false);
    setEventsOpen(false);
    if (!ecosystemOpen) setFeaturedIndex(0);
    setEcosystemOpen(true);
  };
  const openEvents = () => {
    setCoursesOpen(false);
    setFreeOpen(false);
    setEcosystemOpen(false);
    setEventsOpen(true);
  };
  const showPrevious = () => setFeaturedIndex((index) => (index - 1 + featuredCourses.length) % featuredCourses.length);
  const showNext = () => setFeaturedIndex((index) => (index + 1) % featuredCourses.length);

  return <header className="site-header" onMouseLeave={() => { setCoursesOpen(false); setFreeOpen(false); setEcosystemOpen(false); setEventsOpen(false); }}>
    <div className="container site-header-inner">
      <Link href="/" className="brand-mark" aria-label="CPPEM — página inicial"><Image src="/brand/emblema-leao.webp" alt="" width={50} height={50} priority /></Link>
      <nav className="desktop-nav" aria-label="Navegação principal">
        <Link className="nav-link" href="/quem-somos">Quem somos</Link>
        <Link className="nav-link nav-dropdown-trigger" href="/produtos" aria-haspopup="true" aria-expanded={coursesOpen} aria-controls="courses-mega-menu" onClick={() => setCoursesOpen(false)} onMouseEnter={openCourses} onFocus={openCourses}>Produtos <ChevronDown size={14} aria-hidden="true" /></Link>
        {primaryAfterCourses.map(([label, href]) => <Link className="nav-link" href={href} key={label}>{label}</Link>)}
        <button className="nav-link nav-dropdown-trigger" type="button" aria-expanded={ecosystemOpen} aria-controls="ecosystem-mega-menu" onClick={() => ecosystemOpen ? setEcosystemOpen(false) : openEcosystem()} onMouseEnter={openEcosystem} onFocus={openEcosystem}>Ecossistema <ChevronDown size={14} aria-hidden="true" /></button>
        <Link className="nav-link" href="/glossario">Glossário</Link>
        <button className="nav-link nav-dropdown-trigger" type="button" aria-expanded={freeOpen} aria-controls="free-mega-menu" onClick={() => freeOpen ? setFreeOpen(false) : openFree()} onMouseEnter={openFree} onFocus={openFree}>Materiais Gratuitos <ChevronDown size={14} aria-hidden="true" /></button>
        <Link className="nav-link nav-dropdown-trigger nav-events" href="/eventos" aria-haspopup="true" aria-expanded={eventsOpen} aria-controls="events-mega-menu" onClick={() => setEventsOpen(false)} onMouseEnter={openEvents} onFocus={openEvents}><span className="nav-events-dot" aria-hidden="true" />Eventos <ChevronDown size={14} aria-hidden="true" /></Link>
      </nav>
      <div className="header-actions"><Link className="header-action" href="https://plataforma.cppem.com.br">Login</Link><Link className="gold-button" href="/plano-de-combate">Plano de combate</Link></div>
      <button className="mobile-toggle" type="button" aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={mobileOpen} onClick={() => setMobileOpen((value) => !value)}>{mobileOpen ? <X size={22} /> : <Menu size={22} />}</button>
    </div>

    <div className="courses-mega" id="courses-mega-menu" data-open={coursesOpen} aria-hidden={!coursesOpen}>
      <div className="container courses-mega-grid">
        <div className="courses-mega-feature">
          {featured ? <Link href={featured.href} className="courses-feature-card" tabIndex={coursesOpen ? undefined : -1}>
            <img src={featured.menuImageUrl || featured.imageUrl} alt="" /><span className="courses-feature-overlay" />
            <span className="courses-feature-copy"><small>Preparação em destaque</small><strong>{featured.name}</strong><span>Conhecer agora <ArrowRight size={15} /></span></span>
          </Link> : <Link href="/produtos" className="courses-feature-empty" tabIndex={coursesOpen ? undefined : -1}><Image src="/brand/emblema-leao.webp" alt="" width={112} height={112} /><strong>Encontre sua próxima preparação</strong><span>Ver todos os cursos <ArrowRight size={15} /></span></Link>}
          {featuredCourses.length > 1 && <div className="courses-feature-controls"><button type="button" onClick={showPrevious} aria-label="Destaque anterior" tabIndex={coursesOpen ? undefined : -1}><ChevronLeft size={16} /></button><span>{featuredIndex + 1} / {featuredCourses.length}</span><button type="button" onClick={showNext} aria-label="Próximo destaque" tabIndex={coursesOpen ? undefined : -1}><ChevronRight size={16} /></button></div>}
        </div>
        <div className="courses-mega-content">
          <div className="courses-mega-heading">
            <div><span className="eyebrow">Loja CPPEM</span><h2>O que você precisa <span className="gold">hoje?</span></h2></div>
            <Link href="/produtos" onClick={() => setCoursesOpen(false)} tabIndex={coursesOpen ? undefined : -1}>Ver a loja completa{storeTotal ? ` (${storeTotal})` : ""} <ArrowRight size={15} /></Link>
          </div>

          <form className="courses-mega-search" action="/produtos" role="search" onSubmit={() => setCoursesOpen(false)}>
            <Search size={16} aria-hidden="true" />
            <input type="search" name="busca" placeholder="Buscar curso, resumo bizurado, vade mecum..." aria-label="Buscar na loja" tabIndex={coursesOpen ? undefined : -1} />
            <button className="gold-button" type="submit" tabIndex={coursesOpen ? undefined : -1}>Buscar</button>
          </form>

          <div className="courses-store-grid">
            {storeColumns.map(({ titulo, icon: Icon, itens }) => <div className="courses-store-column" key={titulo}>
              <div className="courses-path-label"><Icon size={16} aria-hidden="true" /><span>{titulo}</span></div>
              <ul>{itens.map(({ rotulo, tipo }) => <li key={rotulo}>
                <Link href={`/produtos?tipo=${encodeURIComponent(tipo)}`} onClick={() => setCoursesOpen(false)} tabIndex={coursesOpen ? undefined : -1}>
                  <strong>{rotulo}</strong>{storeCounts[tipo] ? <em>{storeCounts[tipo]}</em> : null}
                </Link>
              </li>)}</ul>
            </div>)}
          </div>

          <div className="courses-store-careers">
            <div className="courses-path-label"><Users size={16} aria-hidden="true" /><span>Comprar por carreira</span></div>
            <div>{courseCategories.map((category) => <Link href={`/produtos/${category.slug}`} key={category.slug} onClick={() => setCoursesOpen(false)} tabIndex={coursesOpen ? undefined : -1}>{category.label}</Link>)}</div>
          </div>
        </div>
      </div>
    </div>

    <div className="courses-mega ecosystem-mega" id="ecosystem-mega-menu" data-open={ecosystemOpen} aria-hidden={!ecosystemOpen}>
      <div className="container ecosystem-mega-grid">
        <div className="ecosystem-mega-content">
          <div className="ecosystem-mega-heading"><span>Escolha seu próximo passo</span><strong>Do estudo à carreira.</strong></div>
          <div className="ecosystem-mega-links">{ecosystemItems.map((item) => {
            const Icon = ecosystemIcons[item.icon as keyof typeof ecosystemIcons] ?? Sparkles;
            return <Link href={item.href} target={item.newTab ? "_blank" : undefined} rel={item.newTab ? "noreferrer" : undefined} data-featured={item.featured} key={item.id} onClick={() => setEcosystemOpen(false)} tabIndex={ecosystemOpen ? undefined : -1}>
              <span className="ecosystem-mega-icon"><Icon size={21} /></span>
              <span><small>{item.label || item.category}</small><strong>{item.name}</strong><p>{item.description}</p></span>
              <ArrowRight size={17} />
            </Link>;
          })}</div>
        </div>
      </div>
    </div>

    <div className="courses-mega free-mega" id="free-mega-menu" data-open={freeOpen} aria-hidden={!freeOpen}>
      <div className="container free-mega-grid">
        <div className="courses-mega-feature">
          {featuredMaterial ? <Link href={`/materiais-gratuitos?material=${encodeURIComponent(featuredMaterial.id)}`} className="courses-feature-card" onClick={() => setFreeOpen(false)} tabIndex={freeOpen ? undefined : -1}>
            {featuredMaterial.imageUrl ? <img src={featuredMaterial.imageUrl} alt="" /> : <Image src="/images/bgnews.webp" alt="" fill sizes="330px" />}
            <span className="courses-feature-overlay" />
            <span className="courses-feature-copy"><small>{featuredMaterial.menuFeatured ? "Material mais baixado" : "Destaque da biblioteca"}</small><strong>{featuredMaterial.name}</strong><span>Baixar gratuitamente <ArrowRight size={15} /></span></span>
          </Link> : <Link href="/materiais-gratuitos" className="courses-feature-empty" onClick={() => setFreeOpen(false)} tabIndex={freeOpen ? undefined : -1}><Image src="/brand/emblema-leao.webp" alt="" width={112} height={112} /><strong>Defina um material em destaque</strong><span>Ver biblioteca gratuita <ArrowRight size={15} /></span></Link>}
          {featuredMaterials.length > 1 && <div className="courses-feature-controls"><button type="button" onClick={() => setFeaturedMaterialIndex((index) => (index - 1 + featuredMaterials.length) % featuredMaterials.length)} aria-label="Material anterior" tabIndex={freeOpen ? undefined : -1}><ChevronLeft size={16} /></button><span>{featuredMaterialIndex + 1} / {featuredMaterials.length}</span><button type="button" onClick={() => setFeaturedMaterialIndex((index) => (index + 1) % featuredMaterials.length)} aria-label="Próximo material" tabIndex={freeOpen ? undefined : -1}><ChevronRight size={16} /></button></div>}
        </div>
        <div className="free-mega-content">
          <div className="courses-mega-heading"><div><span className="eyebrow">Biblioteca CPPEM</span><h2>Escolha sua próxima <span className="gold">ferramenta.</span></h2></div></div>
          <div className="free-mega-links">{free.map(({ label, href, description, icon: Icon }, index) => <Link href={href} key={label} onClick={() => setFreeOpen(false)} tabIndex={freeOpen ? undefined : -1}><span className="free-mega-icon"><Icon size={22} /></span><span><small>{String(index + 1).padStart(2, "0")}</small><strong>{label}</strong><p>{description}</p></span><ArrowRight size={18} /></Link>)}</div>
        </div>
      </div>
    </div>

    <div className="courses-mega events-mega" id="events-mega-menu" data-open={eventsOpen} aria-hidden={!eventsOpen}>
      <div className="container events-mega-grid">
        <div className="events-mega-intro">
          <span className="eyebrow">Agenda CPPEM</span>
          <h2>Eventos <span className="gold">ao vivo</span> e presenciais.</h2>
          <p>Aulões, madrugadas de estudo e encontros com o time CPPEM.</p>
          <Link href="/eventos" onClick={() => setEventsOpen(false)} tabIndex={eventsOpen ? undefined : -1}>Ver todos os eventos{eventsTotal ? ` (${eventsTotal})` : ""} <ArrowRight size={15} /></Link>
        </div>
        <div className="events-mega-list">{events.length ? events.map((event) => {
          const date = formatEventDate(event.date);
          const external = !event.href.startsWith("/");
          return <Link href={event.href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined} className="events-mega-card" data-featured={event.featured} key={event.id} onClick={() => setEventsOpen(false)} tabIndex={eventsOpen ? undefined : -1}>
            <span className="events-mega-media">{event.imageUrl ? <img src={event.imageUrl} alt="" /> : <Image src="/brand/emblema-leao.webp" alt="" width={80} height={80} />}{date && <span className="events-mega-date"><strong>{date.day}</strong>{date.month}</span>}</span>
            <span className="events-mega-copy"><small data-status={event.status}>{event.status}</small><strong>{event.name}</strong><span><CalendarDays size={13} /> {[event.time, event.place].filter(Boolean).join(" · ") || event.format}</span></span>
          </Link>;
        }) : <p className="events-mega-empty">Nenhum evento com inscrições abertas agora. Fique de olho: a próxima agenda sai em breve.</p>}</div>
      </div>
    </div>

    <nav className="mobile-panel" data-open={mobileOpen} aria-label="Navegação móvel">
      <Link href="/quem-somos" onClick={closeMobile}>Quem somos</Link>
      <button className="mobile-course-trigger" type="button" aria-expanded={mobileCoursesOpen} onClick={() => setMobileCoursesOpen((value) => !value)}>Produtos <ChevronDown size={16} /></button>
      <div className="mobile-course-links" data-open={mobileCoursesOpen}>
        <Link href="/produtos" onClick={closeMobile}>Ver a loja completa{storeTotal ? ` (${storeTotal})` : ""}</Link>
        {storeColumns.flatMap(({ itens }) => itens).map(({ rotulo, tipo }) => <Link href={`/produtos?tipo=${encodeURIComponent(tipo)}`} key={rotulo} onClick={closeMobile}>{rotulo}{storeCounts[tipo] ? ` (${storeCounts[tipo]})` : ""}</Link>)}
        {courseCategories.map((category) => <Link href={`/produtos/${category.slug}`} key={category.slug} onClick={closeMobile}>{category.label}</Link>)}
      </div>
      {primaryAfterCourses.map(([label, href]) => <Link href={href} key={label} onClick={closeMobile}>{label}</Link>)}
      <button className="mobile-course-trigger" type="button" aria-expanded={mobileEcosystemOpen} onClick={() => setMobileEcosystemOpen((value) => !value)}>Ecossistema CPPEM <ChevronDown size={16} /></button>
      <div className="mobile-course-links" data-open={mobileEcosystemOpen}>{ecosystemItems.map((item) => <Link href={item.href} target={item.newTab ? "_blank" : undefined} rel={item.newTab ? "noreferrer" : undefined} key={item.id} onClick={closeMobile}>{item.name}</Link>)}</div>
      <Link href="/glossario" onClick={closeMobile}>Glossário</Link>
      <button className="mobile-course-trigger" type="button" aria-expanded={mobileFreeOpen} onClick={() => setMobileFreeOpen((value) => !value)}>Materiais Gratuitos <ChevronDown size={16} /></button>
      <div className="mobile-course-links" data-open={mobileFreeOpen}>{free.map(({ label, href }) => <Link href={href} key={label} onClick={closeMobile}>{label}</Link>)}</div>
      <button className="mobile-course-trigger nav-events" type="button" aria-expanded={mobileEventsOpen} onClick={() => setMobileEventsOpen((value) => !value)}><span><span className="nav-events-dot" aria-hidden="true" />Eventos</span> <ChevronDown size={16} /></button>
      <div className="mobile-course-links" data-open={mobileEventsOpen}><Link href="/eventos" onClick={closeMobile}>Ver todos os eventos</Link>{events.map((event) => <Link href={event.href} target={event.href.startsWith("/") ? undefined : "_blank"} rel={event.href.startsWith("/") ? undefined : "noreferrer"} key={event.id} onClick={closeMobile}>{event.name}</Link>)}</div>
      <Link href="https://plataforma.cppem.com.br">Login</Link><Link className="gold-button" href="/plano-de-combate">Plano de combate</Link>
    </nav>
  </header>;
}
