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


class CrystalLattice(Scene):
    def construct(self):
        p = get_params({"title": "Crystal Lattice", "rows": 4, "cols": 4})
        title = mk_title(p["title"])
        rows, cols = int(p.get("rows", 4)), int(p.get("cols", 4))
        dots = VGroup()
        lines = VGroup()
        spacing = 0.9
        for r in range(rows):
            for c in range(cols):
                x = (c - cols / 2) * spacing + r * 0.25
                y = (r - rows / 2) * spacing * 0.6
                d = Dot(point=[x, y, 0], color=BLUE, radius=0.08)
                dots.add(d)
                if c < cols - 1:
                    lines.add(Line(d.get_center(), [x + spacing, y, 0], color=WHITE, stroke_opacity=0.4))
        body = VGroup(lines, dots)
        drop_content(body)
        self.play(Write(title))
        self.play(LaggedStart(*[FadeIn(d) for d in dots], lag_ratio=0.05), Create(lines))
        self.wait(1)
