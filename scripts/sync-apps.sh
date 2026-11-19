#!/usr/bin/env bash
# Refresh the demo apps served at cictnardc.net/portfolio/<app>/.
#
# Each app keeps its own repo (its source of truth). This script copies the
# ready-to-serve files of every app into apps/<app>/ here, building the two
# React apps for their sub-path first. Commit the result and push: the
# Cloudflare build then only copies files, it never installs or builds anything.
#
#   scripts/sync-apps.sh                 refresh every app
#   scripts/sync-apps.sh dental-clinic   refresh one app
#
# The app repos are looked for next to this repo, under their GitHub name or
# their local folder name (for example ../gp-doctor-office or ../cabinet-medical).
# Override the folder with APPS_ROOT=/path/to/folder.
set -euo pipefail
cd "$(dirname "$0")/.."
ROOT="$(pwd)"
APPS_ROOT="${APPS_ROOT:-$(dirname "$ROOT")}"

# id | folder names to look for | kind | folder inside the repo to publish
APPS="
restaurant-suite|restaurant-suite|static|.
fabrication-suite|fabrication-suite|static|.
warehouse-portal|warehouse-portal-demo|static|.
dental-clinic|dental-clinic-demo dental-clinic|static|.
gp-office|gp-doctor-office cabinet-medical|static|app
warehouse-dashboard|warehouse-dashboard|react|build
plant-data-logger|plant-data-logger-demo plant-data-logger|static|.
integration-toolkit|integration-toolkit|react|build
tray-store-controller|tray-store-controller|static|.
"

# Never published: repo plumbing, notes and the GP app's local installers.
EXCLUDES=(--exclude '.[a-z]*'
          --exclude node_modules --exclude '[A-Z]*.md'
          --exclude vercel.json --exclude .vercel --exclude .vercelignore)

want="${1:-}"
done_any=0
while IFS='|' read -r id names kind out; do
  [ -z "$id" ] && continue
  [ -n "$want" ] && [ "$want" != "$id" ] && continue
  src=""
  for n in $names; do
    if [ -d "$APPS_ROOT/$n" ]; then src="$APPS_ROOT/$n"; break; fi
  done
  if [ -z "$src" ]; then
    echo "!! $id: none of [$names] found in $APPS_ROOT, skipped" >&2
    continue
  fi
  echo "== $id  <-  $src"
  if [ "$kind" = "react" ]; then
    ( cd "$src"
      [ -d node_modules ] || npm ci --no-audit --no-fund --loglevel=error
      PUBLIC_URL="/portfolio/$id" CI=false GENERATE_SOURCEMAP=false npm run build >/dev/null )
  fi
  rm -rf "apps/$id"
  mkdir -p "apps/$id"
  if command -v rsync >/dev/null; then
    rsync -a "${EXCLUDES[@]}" "$src/$out/" "apps/$id/"
  else
    ( cd "$src/$out" && tar cf - "${EXCLUDES[@]}" . ) | ( cd "apps/$id" && tar xf - )
  fi
  echo "   $(find "apps/$id" -type f | wc -l) files, $(du -sh "apps/$id" | cut -f1)"
  done_any=1
done <<< "$APPS"

[ "$done_any" = 1 ] || { echo "Nothing synced." >&2; exit 1; }
echo "Done. Check the apps locally (scripts/build-cloudflare.sh, then serve dist/), commit and push."
