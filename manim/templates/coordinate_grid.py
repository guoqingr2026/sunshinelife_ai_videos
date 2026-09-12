import importlib.util
import os
_spec = importlib.util.spec_from_file_location('templates._path', os.path.join(os.path.dirname(__file__), '_path.py'))
_path_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_path_mod)

from manim import *
from templates._text import mk_text
from templates._params import get_params
from templates._layout import mk_title, drop_content


class CoordinateGrid(Scene):
    def construct(self):
        p = get_params({"title": "???"})
        title = mk_title(p["title"])
        plane = NumberPlane(
            x_range=[-5, 5, 1],
            y_range=[-3, 3, 1],
            background_line_style={"stroke_opacity": 0.35},
        )
        dot = Dot(plane.c2p(2, 1), color=RED)
        vec = Arrow(plane.c2p(0, 0), plane.c2p(2, 1), buff=0, color=GREEN)
        coord = VGroup(plane, dot, vec)
        drop_content(coord)
        label = mk_text("(2, 1)", font_size=22, color=RED).next_to(dot, UR, buff=0.15)
        self.play(Write(title), Create(plane))
        self.play(GrowArrow(vec), FadeIn(dot), Write(label))
        self.wait(1)
