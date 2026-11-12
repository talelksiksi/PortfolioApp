#!/usr/bin/env bash
# Assemble the cictnardc.net site for Cloudflare Pages:
#   /            the company website (website/)
#   /portfolio/  the CICTNA OS portfolio (repo root)
# Output: dist/  (deploy with scripts/deploy-cloudflare.sh)
set -euo pipefail
cd "$(dirname "$0")/.."
rm -rf dist
mkdir -p dist/portfolio
# Company site, without the docs that live next to it.
cp website/index.html website/favicon.svg website/favicon.png website/og-image.png \
   website/email-logo.png website/talel.jpg dist/
# Portfolio.
cp -r index.html quick.html css js assets dist/portfolio/
echo "Built dist/: $(find dist -type f | wc -l) files, $(du -sh dist | cut -f1)"
