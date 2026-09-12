import importlib.util
import os
_spec = importlib.util.spec_from_file_location('templates._path', os.path.join(os.path.dirname(__file__), '_path.py'))
_path_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_path_mod)

from manim import *
from templates._text import mk_text
from templates._params import get_params
from templates._layout import mk_title, drop_content


class ForgettingCurve(Scene):
    def construct(self):
        p = get_params({"title": "遗忘曲线"})
        title = mk_title(p["title"])
        axes = Axes(x_range=[0, 10, 2], y_range=[0, 1, 0.25], x_length=8, y_length=4)
        curve = axes.plot(lambda x: 0.95 * __import__("math").exp(-0.35 * x), color=RED)
        x_lbl = mk_text("时间", font_size=20).next_to(axes, DOWN, buff=0.25)
        y_lbl = mk_text("记忆保留", font_size=20).next_to(axes, LEFT, buff=0.25)
        chart = VGroup(axes, curve, x_lbl, y_lbl)
        drop_content(chart)
        self.play(Write(title), Create(axes), Write(x_lbl), Write(y_lbl))
        self.play(Create(curve))
        self.wait(1)
