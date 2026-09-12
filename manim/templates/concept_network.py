import importlib.util
import os
_spec = importlib.util.spec_from_file_location('templates._path', os.path.join(os.path.dirname(__file__), '_path.py'))
_path_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_path_mod)

import numpy as np
from manim import *
from templates._no_tex import apply_no_tex
apply_no_tex()

from templates._text import mk_text
from templates._params import get_params
from templates._layout import mk_title, drop_content


class ConceptNetwork(Scene):
    def construct(self):
        p = get_params({"center": "Core", "nodes": ["A", "B", "C", "D"], "title": "Concept Network"})
        title = mk_title(p["title"])
        center = Circle(radius=0.6, color=YELLOW, fill_opacity=0.3)
        c_txt = mk_text(p["center"], font_size=18).move_to(center)
        nodes = VGroup()
        lines = VGroup()
        angles = [0, PI / 2, PI, 3 * PI / 2]
        for i, name in enumerate(p["nodes"][:4]):
            ang = angles[i % 4]
            pos = 2.2 * np.array([np.cos(ang), np.sin(ang), 0])
            n = Circle(radius=0.45, color=BLUE, fill_opacity=0.2).move_to(pos)
            t = mk_text(str(name), font_size=18).move_to(n)
            nodes.add(VGroup(n, t))
            lines.add(Line(center.get_center(), n.get_center(), color=WHITE, stroke_opacity=0.6))
        network = VGroup(lines, center, c_txt, nodes)
        drop_content(network)
        self.play(Write(title), FadeIn(center), Write(c_txt))
        self.play(Create(lines), LaggedStart(*[FadeIn(n) for n in nodes], lag_ratio=0.2))
        self.wait(1)
