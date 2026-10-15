import { connection } from "next/server";
import { SiteHeaderClient } from "@/components/layout/site-header-client";
import { getCourseProducts } from "@/lib/data";
import { getFreeMaterials } from "@/lib/notion/free-content";
import { getEcosystemItems } from "@/lib/notion/ecosystem";
import { getEvents } from "@/lib/notion/events";

export async function SiteHeader() {
  // Toda pagina publica passa por aqui, entao isto vale para o site inteiro:
  // a pagina e montada no acesso, nao no build. No Docker o build roda sem as
  // credenciais do Notion e congelaria o menu, a faixa e as vitrines vazios ate
  // o primeiro recalculo. Os dados seguem em cache de 5 minutos.
  await connection();
  const [products, materials, ecosystemItems, events] = await Promise.all([getCourseProducts(), getFreeMaterials(), getEcosystemItems(), getEvents()]);
  const featuredCourses = products
    .filter((product) => product.menuFeatured)
    .sort((a, b) => (a.menuOrder ?? Number.MAX_SAFE_INTEGER) - (b.menuOrder ?? Number.MAX_SAFE_INTEGER))
    .slice(0, 5);
  const markedMaterials = materials
    .filter((material) => material.menuFeatured)
    .sort((a, b) => (a.menuOrder ?? Number.MAX_SAFE_INTEGER) - (b.menuOrder ?? Number.MAX_SAFE_INTEGER))
    .slice(0, 5);
  const featuredMaterials = markedMaterials.length > 0 ? markedMaterials : materials.slice(0, 1);
  // o menu mostra quantos itens existem em cada prateleira da loja
  const storeCounts = products.reduce<Record<string, number>>((contagem, product) => {
    contagem[product.type] = (contagem[product.type] ?? 0) + 1;
    return contagem;
  }, {});

  return <SiteHeaderClient featuredCourses={featuredCourses} featuredMaterials={featuredMaterials} ecosystemItems={ecosystemItems} storeCounts={storeCounts} storeTotal={products.length} events={events.slice(0, 4)} eventsTotal={events.length} />;
}
