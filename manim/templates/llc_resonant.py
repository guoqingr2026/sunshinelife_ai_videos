import importlib.util
import os
_spec = importlib.util.spec_from_file_location('templates._path', os.path.join(os.path.dirname(__file__), '_path.py'))
_path_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_path_mod)

from manim import *
from templates._text import mk_text
from templates._params import get_params
from templates._layout import mk_title, drop_content


class LLCResonant(Scene):
    def construct(self):
        p = get_params({"title": "LLC Resonant"})
        title = mk_title(p["title"])
        pri = Rectangle(width=1.5, height=2, color=BLUE, fill_opacity=0.3).shift(LEFT * 2)
        sec = Rectangle(width=1.5, height=2, color=GREEN, fill_opacity=0.3).shift(RIGHT * 2)
        cr = mk_text("Cr", font_size=24, color=YELLOW).next_to(pri, UP, buff=0.2)
        lr = mk_text("Lr", font_size=24, color=ORANGE).next_to(pri, DOWN, buff=0.2)
        arrow = DoubleArrow(pri.get_right(), sec.get_left(), buff=0.15, color=WHITE)
        body = VGroup(pri, sec, cr, lr, arrow)
        drop_content(body)
        self.play(Write(title))
        self.play(FadeIn(pri), FadeIn(sec), Write(cr), Write(lr))
        self.play(Create(arrow))
        self.wait(1)
