#!/usr/bin/env python3
"""Pass 1 — Skeleton.
Copy Fairdeal Final v1.html → Fairdeal v2.html, replacing base64 data URIs with
placeholder asset paths and extracting the inline <style> block to assets/css/styles.css.
"""

import re
from pathlib import Path

ROOT = Path(__file__).parent.parent
SRC = ROOT / "Fairdeal Final v1.html"
DST_HTML = ROOT / "Fairdeal v2.html"
DST_CSS = ROOT / "assets" / "css" / "styles.css"

# Map v1 line number → target asset path. Derived from grep audit.
LINE_MAP = {
    370: "assets/img/ui/logo.svg",                      # nav logo
    422: "assets/img/hero/01-tvs.webp",
    432: "assets/img/hero/02-acs.webp",
    442: "assets/img/hero/03-fridges.webp",
    452: "assets/img/hero/04-washing.webp",
    462: "assets/img/hero/05-kitchen.webp",
    505: "assets/img/lifestyle/cat-01-tvs.webp",
    511: "assets/img/lifestyle/cat-02-audio.webp",
    517: "assets/img/lifestyle/cat-03-acs.webp",
    523: "assets/img/lifestyle/cat-04-fridges.webp",
    529: "assets/img/lifestyle/cat-05-washing.webp",
    535: "assets/img/lifestyle/cat-06-kitchen.webp",
    541: "assets/img/lifestyle/cat-07-water.webp",
    547: "assets/img/lifestyle/cat-08-fans.webp",
    553: "assets/img/lifestyle/cat-09-personal.webp",
    636: "assets/img/lifestyle/story.webp",
    714: "assets/brands/lg.svg",
    718: "assets/brands/bajaj.svg",
    722: "assets/brands/bpl.svg",
    726: "assets/brands/ifb.svg",
    730: "assets/brands/philips.svg",
    734: "assets/brands/samsung.svg",
    738: "assets/brands/panasonic.svg",
    742: "assets/brands/tcl.svg",
    746: "assets/brands/daikin.svg",
    750: "assets/brands/hitachi.svg",
    754: "assets/brands/godrej.svg",
    758: "assets/brands/voltas.svg",
    762: "assets/brands/carrier.svg",
    766: "assets/brands/haier.svg",
    770: "assets/brands/kelvinator.svg",
    774: "assets/brands/kutchina.svg",
    778: "assets/brands/faber.svg",
    782: "assets/brands/ogeneral.svg",
    786: "assets/brands/hindware.svg",
    790: "assets/brands/venus.svg",
    794: "assets/brands/midea.svg",
    798: "assets/brands/mitsubishi-heavy.svg",
    802: "assets/brands/prestige.svg",
    806: "assets/brands/boat.svg",
    810: "assets/brands/symphony.svg",
    814: "assets/brands/crompton.svg",
    818: "assets/brands/pureit.svg",
    948: "assets/img/ui/logo-white.svg",                # footer logo
}

DATA_URI_RE = re.compile(r'data:image/[^"\']+')


def main():
    DST_CSS.parent.mkdir(parents=True, exist_ok=True)

    with SRC.open("r", encoding="utf-8") as f:
        lines = f.readlines()

    style_start = style_end = None
    out_html = []
    css_block = []

    for i, line in enumerate(lines, start=1):
        if i == 16 and "<style>" in line:
            style_start = i
            # Drop the bare <style> opener; we'll replace block with <link>
            out_html.append('  <link rel="stylesheet" href="assets/css/styles.css">\n')
            continue
        if style_start and not style_end and "</style>" in line:
            style_end = i
            continue
        if style_start and not style_end:
            css_block.append(line)
            continue

        if i in LINE_MAP:
            asset = LINE_MAP[i]
            new_line = DATA_URI_RE.sub(asset, line)
            if new_line == line:
                raise SystemExit(f"line {i}: expected data: URI not found")
            out_html.append(new_line)
        else:
            out_html.append(line)

    # Sanity: every base64 stripped
    leftover = [(i + 1, l) for i, l in enumerate(out_html) if "data:image/" in l]
    if leftover:
        raise SystemExit(f"unhandled base64 lines: {[ln for ln, _ in leftover]}")

    DST_HTML.write_text("".join(out_html), encoding="utf-8")
    DST_CSS.write_text("".join(css_block), encoding="utf-8")

    print(f"wrote {DST_HTML}  ({DST_HTML.stat().st_size:,} bytes)")
    print(f"wrote {DST_CSS}  ({DST_CSS.stat().st_size:,} bytes)")
    print(f"images replaced: {len(LINE_MAP)}")


if __name__ == "__main__":
    main()
