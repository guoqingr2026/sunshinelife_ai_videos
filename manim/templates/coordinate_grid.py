import importlib.util
import os
_spec = importlib.util.spec_from_file_location('templates._path', os.path.join(os.path.dirname(__file__), '_path.py'))
_path_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_path_mod)

from manim import *
from templates._text import mk_text
from templates._params import get_params


class CoordinateGrid(Scene):
    def construct(self):
        p = get_params({"title": "坐标�?})
        plane = NumberPlane(x_range=[-5, 5, 1], y_range=[-3, 3, 1], background_line_style={"stroke_opacity": 0.4})
        dot = Dot(plane.c2p(2, 1), color=RED)
        vec = Arrow(plane.c2p(0, 0), plane.c2p(2, 1), buff=0, color=GREEN)
        title = mk_text(p["title"], font_size=32).to_edge(UP)
        self.play(Write(title), Create(plane))
        self.play(GrowArrow(vec), FadeIn(dot))
        self.wait(1)
