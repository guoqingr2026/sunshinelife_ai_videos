import importlib.util
import os
_spec = importlib.util.spec_from_file_location('templates._path', os.path.join(os.path.dirname(__file__), '_path.py'))
_path_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_path_mod)

from manim import *
from templates._text import mk_text
from templates._params import get_params
from templates._layout import mk_title, drop_content
from templates._axes import make_axes


class FunctionGraphScene(Scene):
    def construct(self):
        p = get_params({"title": "y = sin(x)", "label": "sin(x)"})
        title = mk_title(p["title"])
        axes = make_axes(x_range=[-3, 3, 1], y_range=[-1.5, 1.5, 0.5], x_length=9, y_length=5)
        graph = axes.plot(lambda x: __import__("math").sin(x), color=YELLOW)
        label = mk_text(p["label"], font_size=26, color=YELLOW)
        chart = VGroup(axes, graph)
        drop_content(chart)
        label.next_to(graph, UR, buff=0.2)
        self.play(Write(title), Create(axes))
        self.play(Create(graph), FadeIn(label))
        self.wait(1)
