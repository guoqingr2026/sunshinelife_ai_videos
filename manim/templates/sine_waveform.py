import importlib.util
import os
_spec = importlib.util.spec_from_file_location('templates._path', os.path.join(os.path.dirname(__file__), '_path.py'))
_path_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_path_mod)

from manim import *
from templates._text import mk_text
from templates._params import get_params


class SineWaveform(Scene):
    def construct(self):
        p = get_params({"freq": "50Hz", "title": "正弦波形"})
        axes = Axes(x_range=[0, 4, 1], y_range=[-1.2, 1.2, 0.5], x_length=9, y_length=4)
        wave = axes.plot(lambda x: __import__("math").sin(x * 2 * 3.14159), color=YELLOW)
        label = mk_text(p["freq"], font_size=24, color=YELLOW).to_corner(UR)
        title = mk_text(p["title"], font_size=28).to_edge(UP)
        self.play(Write(title), Create(axes))
        self.play(Create(wave), Write(label))
        self.wait(1)
