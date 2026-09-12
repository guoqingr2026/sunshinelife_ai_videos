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


class BuckConverter(Scene):
    def construct(self):
        p = get_params({"title": "Buck Converter"})
        title = mk_title(p["title"])
        vin = mk_text("Vin", font_size=24).shift(LEFT * 5 + UP * 0.2)
        sw = Square(side_length=0.6, color=YELLOW).shift(LEFT * 2)
        inductor = mk_text("L", font_size=28, color=GREEN).shift(ORIGIN)
        cap = mk_text("C", font_size=28, color=BLUE).shift(RIGHT * 2)
        vout = mk_text("Vout", font_size=24).shift(RIGHT * 5 + DOWN * 0.2)
        path = VGroup(
            Line(vin.get_center(), sw.get_center(), color=WHITE),
            Line(sw.get_center(), inductor.get_center(), color=WHITE),
            Line(inductor.get_center(), cap.get_center(), color=WHITE),
            Line(cap.get_center(), vout.get_center(), color=WHITE),
        )
        body = VGroup(vin, sw, inductor, cap, vout, path)
        drop_content(body)
        self.play(Write(title))
        self.play(Write(vin), FadeIn(sw), Write(inductor), Write(cap), Write(vout))
        self.play(Create(path))
        self.wait(1)
