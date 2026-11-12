#!/usr/bin/env bash
# Build and upload cictnardc.net (Cloudflare Worker "cictnardc", static assets).
#   scripts/deploy-cloudflare.sh           -> upload a new version, NOT live yet
#   scripts/deploy-cloudflare.sh live      -> build, upload and make it live
#   scripts/deploy-cloudflare.sh rollback  -> go back to the previous version
# Needs CLOUDFLARE_API_TOKEN (Workers Scripts: Edit) and CLOUDFLARE_ACCOUNT_ID.
set -euo pipefail
cd "$(dirname "$0")/.."
W="npx --yes wrangler@4"
case "${1:-upload}" in
  upload)   scripts/build-cloudflare.sh; $W versions upload ;;
  live)     scripts/build-cloudflare.sh; $W deploy ;;
  rollback) $W rollback ;;
  *) echo "usage: $0 [upload|live|rollback]"; exit 1 ;;
esac
