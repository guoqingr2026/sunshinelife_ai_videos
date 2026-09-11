import importlib.util
import os
_spec = importlib.util.spec_from_file_location('templates._path', os.path.join(os.path.dirname(__file__), '_path.py'))
_path_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_path_mod)

from manim import *
from templates._text import mk_text


class LLCResonant(Scene):
    def construct(self):
        pri = Rectangle(width=1.5, height=2, color=BLUE, fill_opacity=0.3).shift(LEFT * 2)
        sec = Rectangle(width=1.5, height=2, color=GREEN, fill_opacity=0.3).shift(RIGHT * 2)
        cr = mk_text("Cr", font_size=24, color=YELLOW).shift(UP * 0.5)
        lr = mk_text("Lr", font_size=24, color=ORANGE).shift(DOWN * 0.5)
        title = mk_text("LLC 谐振�?, font_size=28).to_edge(UP)
        self.play(Write(title))
        self.play(FadeIn(pri), FadeIn(sec), Write(cr), Write(lr))
        arrow = DoubleArrow(pri.get_right(), sec.get_left(), buff=0.1, color=WHITE)
        self.play(GrowArrow(arrow))
        self.wait(1)
