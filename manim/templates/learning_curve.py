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
from templates._axes import make_axes


class LearningCurve(Scene):
    def construct(self):
        p = get_params({"title": "Learning Curve", "hint": "Understand first"})
        title = mk_title(p["title"])
        axes = make_axes(x_range=[0, 10, 2], y_range=[0, 1, 0.25], x_length=8, y_length=4)
        curve = axes.plot(lambda x: 1 - __import__("math").exp(-0.5 * x), color=GREEN)
        hint = mk_text(p["hint"], font_size=22, color=YELLOW).to_edge(DOWN, buff=0.5)
        chart = VGroup(axes, curve)
        drop_content(chart)
        self.play(Write(title), Create(axes))
        self.play(Create(curve), Write(hint))
        self.wait(1)
