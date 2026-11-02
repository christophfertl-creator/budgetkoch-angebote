import { politeFetch } from './http.mjs';

const API = 'https://api-scp.spar-ics.com/ecom/pw/v1/search/v1/navigation';
const HITS_PER_PAGE = 32; // mehr liefert die Schnittstelle pro Seite nicht

async function fetchPage(page) {
  const params = new URLSearchParams({ query: '*', sort: 'Relevancy:asc', page: String(page), marketId: '8999', showPermutedSearchParams: 'false', hitsPerPage: String(HITS_PER_PAGE) });
  params.append('filter', 'inAngebot:true');
  params.append('filter', 'pwCategoryIds:lebensmittel');
  const res = await politeFetch(`${API}?${params}`, { headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error(`SPAR Seite ${page}: HTTP ${res.status}`);
  return res.json();
}

export async function fetchSpar() {
  const first = await fetchPage(1);
  const hits = [...first.hits];
  for (let p = 2; p <= Math.min(first.paging?.pageCount ?? 1, 40); p++) hits.push(...(await fetchPage(p)).hits);
  return hits.map(toOffer).filter(Boolean);
}

const UNIT = { G: ['g', 1], GR: ['g', 1], KG: ['g', 1000], ML: ['ml', 1], L: ['ml', 1000], LT: ['ml', 1000], STK: ['stk', 1], ST: ['stk', 1], STUECK: ['stk', 1] };

/** "500 G", "1,5 KG", "6 STK", "4 X 125 G" → { packSize, unit } */
export function parseSize(text) {
  const t = String(text ?? '').toUpperCase().replace(',', '.');
  const multi = t.match(/(\d+)\s*X\s*([\d.]+)\s*([A-Z]+)/);
  const single = t.match(/([\d.]+)\s*([A-Z]+)/);
  const [count, value, u] = multi ? [Number(multi[1]), Number(multi[2]), multi[3]] : single ? [1, Number(single[1]), single[2]] : [];
  const unit = UNIT[u];
  if (!unit || !value) return null;
  return { packSize: count * value * unit[1], unit: unit[0] };
}

function toOffer(hit) {
  const v = hit.masterValues ?? {};
  const geo = v.geoInformation?.[0]?.geoValues ?? {};
  const offer = geo.calculatedPrice;
  const regular = geo.stattPrice ?? geo.basePrice;
  // Mengenrabatte ("ab 2 Stk. je") verfälschen den Einzelpreis – überspringen
  if (!geo.inAngebot || geo.mengenRabatt || !offer || !regular || regular <= offer) return null;
  // Thekenware: Preis gilt je "displayQuantity" (z. B. 100 g), nicht für die ganze Packung
  let size = geo.displayQuantity ? parseSize(`${geo.displayQuantity} ${geo.displayUnit}`) : parseSize(v.name3);
  // Feinkost/Thekenware wird je 100 g verkauft: Packungsgröße aus dem Grundpreis (€/kg bzw. €/l) zurückrechnen
  const perUnit = geo.comparisonPrice_price;
  const cmpUnit = UNIT[String(geo.comparisonPrice_unit ?? '').toUpperCase()];
  if (perUnit && cmpUnit && cmpUnit[0] !== 'stk') {
    const derived = (offer / perUnit) * (geo.comparisonPrice_quantity ?? 1) * cmpUnit[1];
    if (!size || size.unit !== cmpUnit[0] || Math.abs(derived - size.packSize) / derived > 0.15) size = { packSize: Math.round(derived), unit: cmpUnit[0] };
  }
  if (!size) return null;
  return {
    store: 'Spar',
    name: [v.name1, v.name2].filter(Boolean).join(' '),
    category: '',
    ...size,
    regularPrice: regular,
    offerPrice: offer,
    source: `https://www.spar.at/produktwelt/${v.slug}`,
  };
}
