import importlib.util
import os
_spec = importlib.util.spec_from_file_location('templates._path', os.path.join(os.path.dirname(__file__), '_path.py'))
_path_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_path_mod)

from manim import *
from templates._text import mk_text
from templates._params import get_params


class LearningCurve(Scene):
    def construct(self):
        p = get_params({"title": "学习效率曲线"})
        axes = Axes(x_range=[0, 10, 2], y_range=[0, 1, 0.25], x_length=8, y_length=4)
        curve = axes.plot(lambda x: 1 - __import__("math").exp(-0.5 * x), color=GREEN)
        title = mk_text(p["title"], font_size=32).to_edge(UP)
        hint = mk_text("理解优先 �?长期留存", font_size=22, color=YELLOW).to_edge(DOWN)
        self.play(Write(title), Create(axes))
        self.play(Create(curve), Write(hint))
        self.wait(1)
