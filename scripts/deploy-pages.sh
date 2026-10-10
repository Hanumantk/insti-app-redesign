#!/usr/bin/env bash
# Build for GitHub Pages and publish dist/ to the gh-pages branch:
#   https://hanumantk.github.io/insti-app-redesign/
# Usage: npm run deploy
set -euo pipefail
cd "$(dirname "$0")/.."
REMOTE=$(git remote get-url origin)
rm -rf dist
MSYS_NO_PATHCONV=1 BASE_PATH=/insti-app-redesign/ npm run build
cp dist/index.html dist/404.html   # deep links (/insti-app-redesign/home?…) load the SPA shell
touch dist/.nojekyll
cd dist
git init -q -b gh-pages
git config user.name "$(git -C .. config user.name)"
git config user.email "$(git -C .. config user.email)"
git add -A
git commit -q -m "Deploy $(git -C .. rev-parse --short HEAD) to GitHub Pages"
git push -q -f "$REMOTE" gh-pages
echo "Deployed → https://hanumantk.github.io/insti-app-redesign/"
