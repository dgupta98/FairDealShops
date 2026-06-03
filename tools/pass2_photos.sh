#!/usr/bin/env bash
# Pass 2 — Photo fetcher.
# Fetches 5 hero + 9 category + 1 story Unsplash photos.
# Falls back to a branded SVG placeholder on 404.
set -eu
cd "$(dirname "$0")/.."
mkdir -p assets/img/hero assets/img/lifestyle

# path|unsplash-id|label-for-fallback|tint
ROWS="
assets/img/hero/01-tvs.jpg|1593359677879-a4bb92f829d1|LED · QLED · OLED TVs|#0A1929
assets/img/hero/02-acs.jpg|1631545806609-9bc4d3aa1f15|Air Conditioners|#0A6E8E
assets/img/hero/03-fridges.jpg|1571175443880-49e1d25b2bc5|Refrigerators|#1FB5E5
assets/img/hero/04-washing.jpg|1610557892470-55d9e80c0bce|Washing Machines|#0F8FB8
assets/img/hero/05-kitchen.jpg|1556910103-1c02745aae4d|Kitchen Appliances|#C49A5C
assets/img/lifestyle/cat-01-tvs.jpg|1593784991095-a205069470b6|Televisions|#0A1929
assets/img/lifestyle/cat-02-audio.jpg|1545454675-3531b543be5d|Audio|#0A6E8E
assets/img/lifestyle/cat-03-acs.jpg|1581094271901-8022df4466f9|Air Conditioners|#1FB5E5
assets/img/lifestyle/cat-04-fridges.jpg|1584568694244-14fbdf83bd30|Refrigerators|#0F8FB8
assets/img/lifestyle/cat-05-washing.jpg|1626806787461-102c1bfaaea1|Washing Machines|#0A6E8E
assets/img/lifestyle/cat-06-kitchen.jpg|1556909114-f6e7ad7d3136|Kitchen|#C49A5C
assets/img/lifestyle/cat-07-water.jpg|1564540583246-934409427776|Water Purifiers|#1FB5E5
assets/img/lifestyle/cat-08-fans.jpg|1622372730-baee14d04f47|Fans & Coolers|#0A6E8E
assets/img/lifestyle/cat-09-personal.jpg|1620916566398-39f1143ab7be|Personal Care|#C49A5C
assets/img/lifestyle/story.jpg|1604754742629-3e0498a8b75c|Fairdeal Showroom|#0A1929
"

gen_placeholder() {
  out="$1"; label="$2"; tint="$3"
  # Swap .jpg extension to .svg for placeholders
  out_svg="${out%.jpg}.svg"
  cat > "$out_svg" <<EOF
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" role="img" aria-label="$label">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${tint}" stop-opacity="1"/>
      <stop offset="100%" stop-color="#0A1929" stop-opacity="1"/>
    </linearGradient>
    <radialGradient id="r" cx="0.2" cy="0.2" r="0.8">
      <stop offset="0%" stop-color="rgba(255,255,255,0.15)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
    </radialGradient>
  </defs>
  <rect width="1600" height="1000" fill="url(#g)"/>
  <rect width="1600" height="1000" fill="url(#r)"/>
  <text x="800" y="510" text-anchor="middle"
        font-family="'Fraunces', Georgia, serif"
        font-weight="500" font-size="64" fill="rgba(255,255,255,0.92)">${label}</text>
  <text x="800" y="565" text-anchor="middle"
        font-family="'DM Sans', system-ui, sans-serif"
        font-weight="500" font-size="20" letter-spacing="0.2em" fill="rgba(196,154,92,0.85)">FAIRDEAL · KOLKATA</text>
</svg>
EOF
}

fetched=0; placeholders=0
echo "$ROWS" | while IFS='|' read -r path uid label tint; do
  [ -z "$path" ] && continue
  url="https://images.unsplash.com/photo-${uid}?w=1600&q=80&fit=crop&auto=format"
  code=$(curl -sSL -w "%{http_code}" -o "$path" "$url" --max-time 15 || echo "000")
  if [ "$code" = "200" ] && [ "$(stat -f%z "$path" 2>/dev/null || stat -c%s "$path")" -gt 20000 ]; then
    echo "  ✓ ${path##*/}  (Unsplash ${uid:0:10}…)"
  else
    rm -f "$path"
    gen_placeholder "$path" "$label" "$tint"
    echo "  · ${path##*/}  (placeholder — HTTP ${code})"
  fi
done

echo
echo "files:"
ls -la assets/img/hero/ assets/img/lifestyle/ | grep -v "^total\|^d" | awk '{printf "  %s  %s\n", $5, $NF}'
