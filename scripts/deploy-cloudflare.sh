#!/usr/bin/env bash
# Build and upload the site to the Cloudflare Pages project behind cictnardc.net.
#   scripts/deploy-cloudflare.sh            -> preview deployment (safe, own URL)
#   scripts/deploy-cloudflare.sh production -> live site (cictnardc.net)
# Needs CLOUDFLARE_API_TOKEN (Account > Cloudflare Pages > Edit) and
# CLOUDFLARE_ACCOUNT_ID in the environment. PROJECT defaults to "cictnardc".
set -euo pipefail
cd "$(dirname "$0")/.."
PROJECT="${PROJECT:-cictnardc}"
TARGET="${1:-preview}"
scripts/build-cloudflare.sh
if [ "$TARGET" = "production" ]; then
  BRANCH="${PRODUCTION_BRANCH:-main}"
else
  BRANCH="preview"
fi
npx --yes wrangler@3 pages deploy dist --project-name "$PROJECT" --branch "$BRANCH" --commit-dirty=true
