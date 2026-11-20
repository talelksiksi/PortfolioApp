#!/usr/bin/env bash
# Assemble cictnardc.net for the Cloudflare Worker "cictnardc":
#   /                       the company website            (website/)
#   /ar                     sends visitors to the Arabic version
#   /portfolio/             the portfolio page             (portfolio/)
#   /portfolio/<app>/       each live demo app             (apps/<app>/, see scripts/sync-apps.sh)
#   /portfolio/desktop/     the retro desktop, "CICTNA OS" (repo root)
# Output: dist/  (deploy with scripts/deploy-cloudflare.sh)
# Only copies files: no install, no build, so it runs in seconds.
set -euo pipefail
cd "$(dirname "$0")/.."
rm -rf dist
mkdir -p dist/ar dist/portfolio/desktop

# Company website, without the docs that live next to it.
cp website/index.html website/favicon.svg website/favicon.png website/og-image.png \
   website/email-logo.png website/talel.jpg \
   website/portfolio-desktop.jpg website/portfolio-phone.jpg dist/
cp website/ar/index.html dist/ar/

# Portfolio page, and the shared screenshots, CVs and link preview it uses.
cp -r portfolio/. dist/portfolio/
cp -r assets dist/portfolio/

# The retro desktop, one level down.
cp -r index.html quick.html css js assets dist/portfolio/desktop/

# Demo apps.
for d in apps/*/; do
  id="$(basename "$d")"
  if [ -e "dist/portfolio/$id" ]; then echo "apps/$id clashes with a portfolio path" >&2; exit 1; fi
  cp -r "$d" "dist/portfolio/$id"
done

# Headers: the screenshot folders are used as images by other sites (gig and profile pages).
# The two unlisted demos stay online for direct links but are kept out of search engines.
cat > dist/_headers <<'EOF'
/portfolio/*/previews/*
  Access-Control-Allow-Origin: *
  Cache-Control: public, max-age=86400
/portfolio/assets/*
  Cache-Control: public, max-age=86400
/portfolio/warehouse-portal/*
  X-Robots-Tag: noindex
/portfolio/tray-store-controller/*
  X-Robots-Tag: noindex
EOF

echo "Built dist/: $(find dist -type f | wc -l) files, $(du -sh dist | cut -f1)"
