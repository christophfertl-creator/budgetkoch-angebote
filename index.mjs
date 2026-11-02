/**
 * Wöchentlicher Angebots-Import für BudgetKoch.
 * Holt aktuelle Aktionen, ordnet sie den Rezept-Zutaten zu und schreibt offers.json.
 * Aufruf: node index.mjs [Ausgabedatei]
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

import { matchIngredient } from './match.mjs';
import { fetchBilla } from './sources/billa.mjs';
import { fetchSpar } from './sources/spar.mjs';

const SOURCES = { Billa: fetchBilla, Spar: fetchSpar };
const out = process.argv[2] ?? 'public/offers.json';

const offers = [];
const report = {};
for (const [store, fetchStore] of Object.entries(SOURCES)) {
  try {
    const raw = await fetchStore();
    const matched = raw.map((o) => ({ o, m: matchIngredient(o) })).filter((x) => x.m);
    report[store] = { geladen: raw.length, zugeordnet: matched.length };
    for (const { o, m } of matched) {
      offers.push({
        store: o.store,
        name: o.name,
        key: m.key,
        // ml-Zutaten, die in g verkauft werden, als ml weitergeben (1 g ≈ 1 ml)
        unit: m.unit,
        packSize: o.packSize,
        regularPrice: Math.round(o.regularPrice * 100) / 100,
        offerPrice: Math.round(o.offerPrice * 100) / 100,
        source: o.source,
      });
    }
  } catch (e) {
    // Fällt eine Kette aus, sollen die anderen trotzdem erscheinen
    report[store] = { fehler: String(e.message ?? e) };
  }
}

const now = new Date();
const validUntil = new Date(now);
validUntil.setDate(now.getDate() + ((6 - now.getDay() + 7) % 7 || 7)); // nächster Samstag
const result = {
  version: 1,
  generatedAt: now.toISOString(),
  validUntil: validUntil.toISOString().slice(0, 10),
  stores: Object.keys(report).filter((s) => !report[s].fehler),
  offers: offers.sort((a, b) => a.key.localeCompare(b.key) || a.offerPrice - b.offerPrice),
};

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(result, null, 1));
console.log(JSON.stringify(report), '→', offers.length, 'Angebote in', out);
if (offers.length === 0) process.exit(1);
