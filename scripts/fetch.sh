#!/usr/bin/env bash
# usage: scripts/fetch.sh name url [name url ...]  -> public/assets/<name>
cd "$(dirname "$0")/../public/assets"
while [ $# -gt 1 ]; do
  n="$1"; u="$2"; shift 2
  code=$(curl -s -w '%{http_code}' -o "$n" "$u")
  sz=$(wc -c < "$n")
  echo "$code $sz $n"
done
