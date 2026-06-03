#!/usr/bin/env bash
# Pass 2 — Brand SVG fetcher (POSIX-friendly).
set -eu
cd "$(dirname "$0")/.."
mkdir -p assets/brands

# slug|label|simpleicons-slug (empty = generate wordmark)
ROWS="
lg|LG|lg
bajaj|Bajaj|bajaj
bpl|BPL|
ifb|IFB|
philips|Philips|philips
samsung|Samsung|samsung
panasonic|Panasonic|panasonic
tcl|TCL|tcl
daikin|Daikin|daikin
hitachi|Hitachi|hitachi
godrej|Godrej|godrej
voltas|Voltas|
carrier|Carrier|
haier|Haier|haier
kelvinator|Kelvinator|
kutchina|Kutchina|
faber|Faber|
ogeneral|O·GENERAL|
hindware|Hindware|
venus|Venus|
midea|Midea|midea
mitsubishi-heavy|MHI|mitsubishi
prestige|Prestige|
boat|boAt|boat
symphony|Symphony|
crompton|Crompton|
pureit|Pureit|
"

gen_wordmark() {
  out="$1"; label="$2"
  cat > "$out" <<EOF
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" role="img" aria-label="$label">
  <title>$label</title>
  <text x="100" y="40" text-anchor="middle"
        font-family="'DM Sans', system-ui, sans-serif"
        font-weight="700" font-size="24" letter-spacing="0.04em"
        fill="#0A1929">$label</text>
</svg>
EOF
}

ok=0; gen=0; total=0
echo "$ROWS" | while IFS='|' read -r slug label si; do
  [ -z "$slug" ] && continue
  total=$((total+1))
  out="assets/brands/${slug}.svg"
  if [ -n "$si" ]; then
    code=$(curl -sSL -w "%{http_code}" -o "$out" "https://cdn.simpleicons.org/${si}")
    if [ "$code" = "200" ] && head -1 "$out" | grep -q "<svg"; then
      echo "  ✓ ${slug} ← simpleicons/${si}"
      continue
    fi
    echo "  ! ${slug} simpleicons returned ${code}, falling back"
  fi
  gen_wordmark "$out" "$label"
  echo "  · ${slug} (wordmark)"
done

echo
echo "files in assets/brands:"
ls assets/brands | wc -l
