import importlib.util
import os
_spec = importlib.util.spec_from_file_location('templates._path', os.path.join(os.path.dirname(__file__), '_path.py'))
_path_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_path_mod)

from manim import *
from templates._no_tex import apply_no_tex
apply_no_tex()

from templates._text import mk_text
from templates._params import get_params
from templates._layout import mk_title, drop_content


class VectorSum(Scene):
    def construct(self):
        p = get_params({"title": "Vector Sum"})
        title = mk_title(p["title"])
        o = ORIGIN
        v1_end = RIGHT * 2 + UP * 0.8
        v2_end = RIGHT * 1.2 + DOWN * 1.0
        v1 = Arrow(o, v1_end, buff=0, color=BLUE)
        v2 = Arrow(o, v2_end, buff=0, color=GREEN)
        vr = Arrow(o, v1_end + v2_end, buff=0, color=YELLOW)
        diagram = VGroup(v1, v2, vr)
        drop_content(diagram)
        t1 = mk_text("a", font_size=24, color=BLUE).next_to(v1.get_center(), UL, buff=0.1)
        t2 = mk_text("b", font_size=24, color=GREEN).next_to(v2.get_center(), DR, buff=0.1)
        tr = mk_text("a+b", font_size=22, color=YELLOW).next_to(vr.get_center(), UR, buff=0.1)
        self.play(Write(title))
        self.play(GrowArrow(v1), GrowArrow(v2), Write(t1), Write(t2))
        self.play(GrowArrow(vr), Write(tr))
        self.wait(1)
