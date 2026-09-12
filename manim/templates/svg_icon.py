import importlib.util
import os
_spec = importlib.util.spec_from_file_location('templates._path', os.path.join(os.path.dirname(__file__), '_path.py'))
_path_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_path_mod)

from manim import *
from templates._no_tex import apply_no_tex
apply_no_tex()

from templates._params import get_params
from templates._layout import mk_title, drop_content
from templates._media import resolve_media_path
from templates._text import mk_text


class SvgIcon(Scene):
    def construct(self):
        p = get_params({"title": "SVG", "svgPath": "icon.svg", "scale": 2.5})
        title = mk_title(p["title"])
        path = resolve_media_path(p["svgPath"])
        if os.path.exists(path) and path.lower().endswith(".svg"):
            try:
                icon = SVGMobject(path).scale(float(p.get("scale", 2.5)))
            except Exception:
                icon = mk_text("SVG load error", font_size=24, color=RED)
        else:
            icon = mk_text("SVG not found", font_size=24, color=RED)
        drop_content(icon)
        self.play(Write(title), FadeIn(icon, scale=0.5))
        self.play(icon.animate.scale(1.1), run_time=0.5)
        self.wait(1)
