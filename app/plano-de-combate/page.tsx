import type { Metadata } from "next";
import Image from "next/image";
import {
  ArrowDown,
  ArrowRight,
  BrainCircuit,
  CalendarCheck2,
  ChartNoAxesCombined,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Crosshair,
  Crown,
  FileText,
  Layers,
  Map,
  Medal,
  MessageCircle,
  PlayCircle,
  ShieldCheck,
  Target,
  Users,
  X,
} from "lucide-react";
import { AnimatedStat } from "@/components/about/animated-stat";
import { CombatPlatformStory } from "@/components/combat/combat-platform-story";
import { StudentProof } from "@/components/home/student-proof";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { approvedStudentImages } from "@/lib/mock-data";
import { AboutTicker } from "@/components/about/about-ticker";
import { AboutHowItWorks } from "@/components/about/about-how-it-works";
import "./combate-mobile.css";

export const metadata: Metadata = {
  title: "Plano de Combate",
  description: "Cronograma personalizado, acompanhamento e uma plataforma completa para transformar sua rotina em preparação para concursos.",
  alternates: { canonical: "/plano-de-combate" },
};

const methodFeatures = [
  { icon: Target, title: "Orientação personalizada", copy: "A rota nasce do seu concurso, do seu nível atual e do tempo que você realmente tem disponível." },
  { icon: CalendarCheck2, title: "Planejamento diário", copy: "Cada dia chega organizado em missões claras, com disciplina, conteúdo e prioridade definidos." },
  { icon: FileText, title: "Material exclusivo", copy: "Aulas, PDFs, questões e recursos de revisão reunidos no mesmo fluxo de estudo." },
  { icon: Users, title: "Mentoria especializada", copy: "Professores e mentores ajudam a corrigir a rota antes que uma dificuldade vire atraso." },
  { icon: MessageCircle, title: "Comunidade em missão", copy: "Você avança ao lado de alunos que perseguem o mesmo objetivo e entendem o processo." },
  { icon: ClipboardCheck, title: "Simulados e correções", copy: "Desempenho acompanhado por dados para transformar erros em decisões de estudo." },
] as const;

const comparisonRows = [
  ["Direção clara do que estudar", "Plano guiado", "Aluno segue perdido", "Só entrega a aula", "Conteúdo espalhado"],
  ["Acompanhamento de mentor", "Mentoria contínua", "Você por conta", "Sem acompanhamento", "Ninguém te guia"],
  ["Cronograma de revisões e simulados", "Estruturado para a prova", "Fica a seu critério", "Raro ou inexistente", "Você monta sozinho"],
  ["Método e didática próprios", "Didática própria", "Padrão de mercado", "Só a aula do day", "Cada fonte é diferente"],
  ["Preparação de TAF e psicotécnico", "Dentro da trilha", "Não oferece", "Por fora, se houver", "Você se vira"],
  ["Metas, ranking e constância", "Plataforma própria", "Sem sistema de constância", "Nada além da aula", "Sem constância"],
] as const;

const platformFeatures = [
  { position: "missions", title: "Missões diárias", description: "Organize o que estudar em cada etapa da preparação.", Icon: CalendarCheck2 },
  { position: "plan", title: "Plano de combate", description: "Siga um cronograma alinhado ao seu objetivo e à sua rotina.", Icon: Map },
  { position: "arsenal", title: "Arsenal de fogo", description: "Encontre aulas, PDFs, simulados e materiais por disciplina.", Icon: Crosshair },
  { position: "summaries", title: "Resumos e mapas mentais", description: "Revise conteúdos com anotações e recursos visuais.", Icon: BrainCircuit },
  { position: "performance", title: "Desempenho operacional", description: "Acompanhe acertos, erros e a evolução dos seus estudos.", Icon: ChartNoAxesCombined },
] as const;

const plans = [
  {
    eyebrow: "Entrada estratégica",
    name: "Operacional",
    description: "Para quem precisa sair da desorganização e começar a executar uma rotina inteligente.",
    installment: 61.0,
    cash: 732,
    href: "https://checkout.cppem.com.br/pay/plano-de-combate-operacional-01",
    cta: "Quero o Operacional",
    featured: false,
    ribbon: null,
    features: [
      "Cronograma personalizado e individualizado",
      "Metas diárias com videoaulas, PDFs e questões",
      "Relatórios semanais de progresso",
      "Ranking de estudos e simulados",
      "Grupo VIP de apoio ao aluno",
      "Inteligência artificial para auxiliar nos estudos",
    ],
  },
  {
    eyebrow: "Mais escolhido",
    name: "Tático",
    description: "Para quem quer unir planejamento, conteúdo completo e contato recorrente com os mentores.",
    installment: 104.02,
    cash: 997,
    href: "https://checkout.cppem.com.br/pay/plano-de-combate-tatico-01",
    cta: "Quero o Tático",
    featured: false,
    ribbon: null,
    features: [
      "Tudo do Plano Operacional",
      "Mentorias ao vivo mensais",
      "Acesso aos cursos da plataforma",
      "Mudança de curso sempre que necessário",
      "Acesso às aulas e aos materiais didáticos",
      "Preparação de TAF, psicotécnico e método MDT",
    ],
  },
  {
    eyebrow: "Arsenal completo",
    name: "Supremo",
    description: "Para quem busca o nível máximo de acompanhamento e materiais estratégicos CPPEM.",
    installment: 208.35,
    cash: 1997,
    href: "https://checkout.cppem.com.br/pay/plano-de-combate-supremo-01",
    cta: "Quero o Supremo",
    featured: true,
    ribbon: "Nível máximo",
    features: [
      "Tudo dos planos Operacional e Tático",
      "Acesso a matérias extras",
      "Resumo Bizurado Carreiras Policiais digital",
      "Vade-Mécum Tático digital",
      "Caderno de Treinamento Tático digital",
      "Redação Bizurada digital",
    ],
  },
] as const;

const moeda = (valor: number, casas = 2) => valor.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });

// quantos beneficios cada plano herda dos de baixo: conta a partir da propria lista
const beneficiosHerdados = (indice: number) => plans.slice(0, indice)
  .reduce((total, plano) => total + plano.features.filter((item) => !item.startsWith("Tudo d")).length, 0);

function PlanCard({ plan }: { plan: (typeof plans)[number] }) {
  const indice = plans.indexOf(plan);
  const [heranca, ...proprios] = plan.features;
  const herda = heranca.startsWith("Tudo d");
  const parcelado = plan.installment * 12;
  const economia = parcelado - plan.cash;
  const desconto = Math.round((economia / parcelado) * 100);
  const temDesconto = economia >= 1;

  return <article className={`combat-plan-card${plan.featured ? " featured" : ""}`}>
    {plan.ribbon && <span className="combat-plan-ribbon"><Crown size={13}/>{plan.ribbon}</span>}
    <small>{plan.eyebrow}</small>
    <h3>Plano {plan.name}</h3>
    <p>{plan.description}</p>

    {herda && <div className="combat-plan-inherit">
      <Layers size={20}/>
      <span><strong>{heranca}</strong><small>{beneficiosHerdados(indice)} benefícios já inclusos</small></span>
    </div>}

    <ul>{(herda ? proprios : plan.features).map((feature)=><li key={feature}><CheckCircle2 size={17}/><span>{feature}</span></li>)}</ul>

    <div className="combat-plan-price">
      {temDesconto
        ? <span className="combat-plan-discount">{desconto}% OFF à vista</span>
        : <span className="combat-plan-discount combat-plan-discount-soft">12x sem juros</span>}
      <span className="combat-plan-installment">12x de</span>
      <strong>R$ {moeda(plan.installment)}</strong>
      {temDesconto
        ? <div className="combat-plan-cash">
            <del>R$ {moeda(parcelado)} no cartão</del>
            <b>R$ {moeda(plan.cash, 0)} à vista</b>
            <em>Economize R$ {moeda(economia, 0)}</em>
          </div>
        : <div className="combat-plan-cash"><b>ou R$ {moeda(plan.cash, 0)} à vista</b></div>}
    </div>

    <a className={plan.featured?"gold-button":"ghost-button"} href={plan.href} target="_blank" rel="noreferrer">{plan.cta}<ArrowRight size={17}/></a>
  </article>;
}

export default function PlanoDeCombatePage() {
  return <div className="page-shell combat-page"><SiteHeader /><main>
    <section className="combat-hero">
      <Image src="/images/plano-combate/bgsniper.webp" alt="" fill priority sizes="100vw" className="combat-hero-image" />
      <div className="combat-hero-overlay" />
      <div className="container combat-hero-content">
        <div className="combat-hero-emblem"><Image src="/brand/emblema-leao.webp" alt="" width={84} height={84} /></div>
        <span className="combat-kicker">Plano de Combate CPPEM</span>
        <h1>A prova é individual.<br/><span>A estratégia não precisa ser.</span></h1>
        <p>Você entra com o objetivo. Nós organizamos a rota, o ritmo e o acompanhamento para transformar intenção em execução diária.</p>
        <div className="combat-hero-actions">
          <a className="gold-button" href="#planos">Escolher meu plano <ArrowRight size={18}/></a>
          <a className="combat-text-link" href="#metodo">Entender como funciona <ArrowDown size={17}/></a>
        </div>
      </div>
      <a className="combat-scroll-cue" href="#cronograma" aria-label="Ir para a próxima seção"><ArrowDown size={20}/></a>
    </section>

      <AboutTicker />
      <AboutHowItWorks />

    <section className="combat-work-section" id="cronograma"><div className="container">
      <div className="combat-section-heading combat-centered-heading">
        <span className="eyebrow">Seu plano. Sua rotina.</span>
        <h2 className="display-title">Faremos o trabalho pesado <span className="gold">para você.</span></h2>
        <p>O Plano de Combate transforma o seu concurso, disponibilidade e desempenho em uma sequência clara de missões. Você abre a plataforma e sabe o que fazer.</p>
      </div>

      <CombatPlatformStory />

      <section className="about-platform-section">
        <div className="container about-platform-heading">
          <span className="eyebrow">Ecossistema CPPEM</span>
          <h2 className="display-title">Uma plataforma completa para organizar sua <span className="gold">preparação.</span></h2>
          <p className="section-copy">Estratégia, conteúdo e acompanhamento reunidos em um único ambiente para você saber o que estudar, como evoluir e onde concentrar seus esforços.</p>
        </div>

        <div className="container about-platform-stage">
          <div className="about-platform-window">
            <div className="about-platform-bar" aria-hidden="true"><span/><span/><span/><strong>Painel do aluno CPPEM</strong></div>
            <Image className="about-platform-image" src="/images/plataforma-cppem2.png" alt="Painel do aluno CPPEM mostrando briefing da missão, objetivos e funcionalidades da plataforma" width={1599} height={778}/>
          </div>

          <div className="about-platform-callouts">
            {platformFeatures.map(({ position, title, description, Icon }) => <article className={`about-platform-callout about-platform-${position}`} key={title}>
              <span className="about-platform-icon"><Icon size={18}/></span>
              <div><h3>{title}</h3><p>{description}</p></div>
            </article>)}
          </div>
        </div>
      </section>


    </div></section>

<section className="about-comparison-section">
        <div className="container about-comparison-heading">
          <span className="eyebrow">Por que o CPPEM</span>
          <h2 className="display-title"><span className="gold">CPPEM</span> vs. o caminho comum</h2>
          <p className="section-copy">A diferença entre estudar muito e estudar certo até vestir a farda.</p>
        </div>

        <div className="container about-comparison-panel">
          <div className="about-comparison-scroll">
            <table className="about-comparison-table">
              <thead><tr><th>O que você precisa</th><th className="about-cppem-column">CPPEM</th><th>Cursinhos online</th><th>Cursinhos presenciais</th><th>Material da internet</th></tr></thead>
              <tbody>{comparisonRows.map(([criterion, cppem, online, inPerson, internet]) => <tr key={criterion}>
                <th scope="row">{criterion}</th>
                <td className="about-cppem-cell"><span className="about-compare-mark about-compare-yes"><Check size={15}/></span>{cppem}</td>
                <td><span className="about-compare-mark about-compare-no"><X size={15}/></span>{online}</td>
                <td><span className="about-compare-mark about-compare-no"><X size={15}/></span>{inPerson}</td>
                <td><span className="about-compare-mark about-compare-no"><X size={15}/></span>{internet}</td>
              </tr>)}</tbody>
            </table>
          </div>
          <p className="about-comparison-hint">Arraste para o lado para comparar todas as colunas.</p>
        </div>
      </section>

    <section className="combat-mentor-section"><div className="container combat-mentor-layout">
      <div className="combat-mentor-portrait"><Image src="/images/plano-combate/everton-mentor.jpg" alt="Everton Mota, mentor do Plano de Combate" width={1000} height={1250} sizes="(max-width: 980px) 90vw, 440px"/></div>
      <div className="combat-mentor-copy"><span className="eyebrow">Comando da preparação</span><h2 className="display-title">Método criado por quem conhece <span className="gold">o campo de prova.</span></h2><h3>Everton Mota <small>Mentor CPPEM</small></h3><p>A metodologia transforma experiência em direção prática: um cronograma possível de cumprir, acompanhamento para corrigir desvios e uma equipe que mantém o aluno em movimento até a prova.</p><div className="combat-mentor-points"><span><Medal size={19}/> Estratégia aplicada à rotina</span><span><ShieldCheck size={19}/> Acompanhamento contínuo</span><span><PlayCircle size={19}/> Conteúdo conectado à missão</span></div><a className="gold-button" href="#planos">Quero ser acompanhado <ArrowRight size={17}/></a></div>
    </div></section>

    <section className="combat-proof-section"><div className="container combat-centered-heading"><span className="eyebrow">Prova real</span><h2 className="display-title">Quem executou o plano <span className="gold">chegou mais longe.</span></h2><p>Histórias reais de alunos CPPEM. Sem personagens inventados, apenas os registros de quem viveu essa preparação.</p></div><StudentProof images={approvedStudentImages}/><div className="container combat-stats"><AnimatedStat prefix="+" start={1000} end={14000} label="alunos aprovados"/><AnimatedStat start={1} end={7} suffix="+" label="anos de estrada" duration={1500}/><article className="about-stat"><strong>Caruaru–PE</strong><span>base da nossa missão</span></article></div></section>

    <section className="combat-results-section"><div className="container combat-results-layout"><div><span className="eyebrow">O que muda na prática</span><h2 className="display-title">Menos improviso.<br/><span className="gold">Mais execução.</span></h2></div><div className="combat-results-list">{[
      ["01","Você deixa de montar o estudo do zero","Recebe uma missão diária conectada ao seu cronograma."],
      ["02","Você deixa de medir esforço por horas","Acompanha conclusão, acertos, revisões e constância."],
      ["03","Você deixa de caminhar sem feedback","A equipe identifica desvios e ajuda a ajustar a rota."],
    ].map(([number,title,copy])=><article key={number}><span>{number}</span><div><h3>{title}</h3><p>{copy}</p></div></article>)}</div></div></section>

    <section className="combat-plans-section" id="planos"><div className="container"><div className="combat-centered-heading"><span className="eyebrow">Escolha sua estratégia</span><h2 className="display-title">Três níveis. <span className="gold">Uma missão.</span></h2><p>Entre pelo caminho que combina com a profundidade de acompanhamento que você busca hoje.</p></div><div className="combat-plans-grid">{plans.map((plan)=><PlanCard plan={plan} key={plan.name}/>)}</div><p className="combat-plan-note">Os valores e condições exibidos correspondem às ofertas atuais cadastradas no site CPPEM. A confirmação final acontece na página de contratação.</p></div></section>
  </main><SiteFooter/></div>;
}
