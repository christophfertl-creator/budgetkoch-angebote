#!/bin/bash
# Wöchentlicher Angebots-Import auf dem Mac (SPAR sperrt GitHub-Server).
# Läuft per launchd (at.budgetkoch.angebote) montags und beim Anmelden;
# pro Woche wird nur einmal erfolgreich importiert.
set -euo pipefail
export PATH="/Users/cfertl/.local/bin:/opt/homebrew/bin:/usr/bin:/bin"
cd "$(dirname "$0")"

STAMP="$HOME/Library/Logs/budgetkoch-angebote.stamp"
WEEK="$(date +%G-W%V)"
if [ "$(cat "$STAMP" 2>/dev/null)" = "$WEEK" ]; then
  echo "$(date): Woche $WEEK schon importiert"
  exit 0
fi

echo "$(date): Import für Woche $WEEK"
git pull --rebase --quiet
node index.mjs public/offers.json
git add public/offers.json
if ! git diff --cached --quiet; then
  git commit --quiet -m "Angebote vom $(date +%d.%m.%Y) (Mac)"
  git push --quiet
fi
echo "$WEEK" > "$STAMP"
echo "$(date): fertig"
