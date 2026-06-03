#!/usr/bin/env python3
"""Pass 2 — fix image paths in v2.html to match actual files on disk.

pass1_skeleton.py wrote .webp paths; pass2 fetched real JPGs for most and
SVG placeholders for the 404s. This script reconciles the HTML references
to whatever extension actually exists.
"""

import re
from pathlib import Path

ROOT = Path(__file__).parent.parent
HTML = ROOT / "Fairdeal v2.html"

text = HTML.read_text(encoding="utf-8")

# Find every asset reference with a placeholder extension and rewrite to actual one.
pattern = re.compile(r'(assets/(?:img|brands)/[^"\']+?)\.(webp|svg|jpg)')

def resolve(m):
    base = m.group(1)
    # Probe disk in preference order: .jpg, .svg, .webp
    for ext in ("jpg", "svg", "webp", "png"):
        candidate = ROOT / f"{base}.{ext}"
        if candidate.exists():
            return f"{base}.{ext}"
    # No file — leave as-is with original ext
    return m.group(0)

new = pattern.sub(resolve, text)
HTML.write_text(new, encoding="utf-8")

# Report
refs = pattern.findall(new)
print(f"image refs in v2.html: {len(refs)}")
missing = [f"{b}.{e}" for b, e in refs if not (ROOT / f"{b}.{e}").exists()]
if missing:
    print("MISSING:")
    for m in missing:
        print(f"  - {m}")
else:
    print("all references resolve to files on disk ✓")
