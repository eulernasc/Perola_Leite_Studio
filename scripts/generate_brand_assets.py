#!/usr/bin/env python3
"""Renderiza assets SVG do estúdio em PNG para PWA e compartilhamento social.
Executado pelo GitHub Actions. Não depende de serviço externo ou credenciais.
"""
from pathlib import Path
import cairosvg

BASE = Path(__file__).resolve().parents[1]
ASSETS = BASE / "assets"
JOBS = [
    ("brand-icon.svg", "icon-192.png", 192, 192),
    ("brand-icon.svg", "icon-512.png", 512, 512),
    ("brand-icon.svg", "icon-maskable-512.png", 512, 512),
    ("brand-icon.svg", "apple-touch-icon.png", 180, 180),
    ("brand-icon.svg", "favicon-32.png", 32, 32),
    ("social-preview.svg", "social-preview.png", 1200, 630),
]
for src, dst, width, height in JOBS:
    destination = ASSETS / dst
    cairosvg.svg2png(
        url=str(ASSETS / src),
        write_to=str(destination),
        output_width=width,
        output_height=height,
    )
    print(f"{destination.relative_to(BASE)}: {destination.stat().st_size} bytes")
