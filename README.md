# BudgetKoch – Angebots-Import

Holt einmal pro Woche die aktuellen Aktionen von BILLA und SPAR, ordnet sie den
Rezept-Zutaten der App zu und schreibt `public/offers.json`. Die App lädt diese Datei.

```bash
npm install
node index.mjs public/offers.json
```

- `sources/` – je Handelskette ein Abruf (höflich: eigener User-Agent, 1,5 s Pause pro Anfrage)
- `match.mjs` – Zuordnung Produktname → Zutat (z. B. „Maishendl Filetschnitzel“ → `huhn`)
- `.github/workflows/angebote.yml` – automatischer Lauf jeden Montag früh

**Rechtlicher Hinweis:** Das automatische Auslesen ist für den Prototyp gedacht. Vor einer
Veröffentlichung im App Store muss die Nutzung rechtlich geprüft oder durch eine
lizenzierte Datenquelle ersetzt werden.
