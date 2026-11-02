import { politeFetch } from './http.mjs';

/** Lebensmittel-Kategorien mit Aktionen im BILLA Online Shop. */
const CATEGORIES = [
  'obst-und-gemuese-13751',
  'brot-und-gebaeck-15520',
  'fleisch-wurst-und-fisch-15388',
  'kuehlwaren-15416',
  'tiefkuehl-15415',
  'vorratsschrank-15012',
];
const PAGE_SIZE = 100;

async function fetchPage(category, page) {
  const params = new URLSearchParams({ inPromotion: 'true', page: String(page), pageSize: String(PAGE_SIZE), sortBy: 'relevance' });
  const res = await politeFetch(`https://shop.billa.at/api/product-discovery/categories/${category}/products?${params}`, { headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error(`BILLA ${category} Seite ${page}: HTTP ${res.status}`);
  return res.json();
}

export async function fetchBilla() {
  const raw = [];
  for (const category of CATEGORIES) {
    // Seiten zählen ab 0; höchstens 10 Seiten pro Kategorie
    for (let page = 0; page < 10; page++) {
      const data = await fetchPage(category, page);
      raw.push(...data.results);
      if (data.offset + data.count >= data.total || data.count === 0) break;
    }
  }
  return raw.map(toOffer).filter(Boolean);
}

const UNIT = { g: ['g', 1], gr: ['g', 1], kg: ['g', 1000], ml: ['ml', 1], l: ['ml', 1000], lt: ['ml', 1000], stk: ['stk', 1], st: ['stk', 1] };

function toOffer(p) {
  const price = p.price ?? {};
  const offer = price.regular?.value;
  const regular = price.crossed;
  // Nur echte Preisaktionen (durchgestrichener Normalpreis); Mengenaktionen ("ab 2 Stk.") überspringen
  if (!p.inPromotion || !offer || !regular || regular <= offer) return null;
  if (price.regular?.promotionType === 'FROM' && !p.weightArticle) return null;
  const unit = UNIT[(p.volumeLabelKey || p.volumeLabelShort || '').toLowerCase()];
  const amount = parseFloat(String(p.amount).replace(',', '.'));
  if (!unit || !amount) return null;
  return {
    store: 'Billa',
    name: p.name,
    category: p.category ?? '',
    packSize: amount * unit[1],
    unit: unit[0],
    regularPrice: regular / 100,
    offerPrice: offer / 100,
    source: `https://shop.billa.at/produkte/${p.slug}`,
  };
}
