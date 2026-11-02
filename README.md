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

## Lauf auf dem Mac
SPAR sperrt Anfragen von GitHub-Servern (HTTP 403). Deshalb läuft der Import zusätzlich
auf dem Mac: `mac-import.sh`, gestartet von `~/Library/LaunchAgents/at.budgetkoch.angebote.plist`
(montags 07:00, verpasste Läufe werden nachgeholt, einmal pro Woche). Protokoll:
`~/Library/Logs/budgetkoch-angebote.log`. Die GitHub-Action bleibt als Ersatz; fällt dort eine
Kette aus, behält sie deren noch gültige Angebote.
