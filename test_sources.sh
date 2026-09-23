#!/bin/bash

echo "Testing RSS sources...\n"

sources=(
  "Hypebeast|https://hypebeast.com/feed"
  "Highsnobiety|https://www.highsnobiety.com/feed/"
  "Collab Substack|https://collab.substack.com"
  "Consumer Culture|https://databutmakeitfashion.substack.com/feed"
  "The Business of Fashion|https://www.businessoffashion.com/feed"
  "Fast Company|https://www.fastcompany.com/feed"
  "Wired|https://www.wired.com/feed/rss"
  "TechCrunch|https://techcrunch.com/feed/"
  "Scroll.in|https://scroll.in/feed"
  "Outlook India|https://www.outlookindia.com/feed"
)

for source in "${sources[@]}"; do
  IFS='|' read -r name url <<< "$source"
  response=$(curl -s -m 5 "$url" 2>&1 | head -100)
  
  if echo "$response" | grep -q -i "captcha"; then
    echo "❌ $name — Blocked by Cloudflare"
  elif echo "$response" | grep -q -E "<?xml|<rss|<feed"; then
    echo "✓ $name — Working"
  else
    echo "⚠️  $name — No XML/RSS detected"
  fi
done
