import importlib.util
import os
import math
_spec = importlib.util.spec_from_file_location('templates._path', os.path.join(os.path.dirname(__file__), '_path.py'))
_path_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_path_mod)

from manim import *
from templates._no_tex import apply_no_tex
apply_no_tex()

from templates._params import get_params
from templates._layout import mk_title, drop_content
import numpy as np
from templates._text import mk_text


class PieChartScene(Scene):
    def construct(self):
        p = get_params({"title": "Pie Chart", "values": [30, 25, 20, 25], "labels": ["A", "B", "C", "D"]})
        title = mk_title(p["title"])
        values = [float(v) for v in p["values"]]
        labels = p.get("labels", [])
        total = sum(values) or 1
        colors = [BLUE, GREEN, YELLOW, RED, TEAL, PURPLE]
        sectors = VGroup()
        start = 0
        for i, v in enumerate(values):
            angle = TAU * v / total
            sec = Sector(outer_radius=2, angle=angle, start_angle=start, color=colors[i % len(colors)], fill_opacity=0.75)
            sectors.add(sec)
            if i < len(labels):
                mid = start + angle / 2
                lbl = mk_text(str(labels[i]), font_size=18).move_to(1.2 * np.array([math.cos(mid), math.sin(mid), 0]))
                sectors.add(lbl)
            start += angle
        drop_content(sectors)
        self.play(Write(title))
        self.play(LaggedStart(*[FadeIn(s) for s in sectors], lag_ratio=0.15))
        self.wait(1)
