import importlib.util
import os
_spec = importlib.util.spec_from_file_location('templates._path', os.path.join(os.path.dirname(__file__), '_path.py'))
_path_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_path_mod)

from manim import *
from templates._no_tex import apply_no_tex
apply_no_tex()

from templates._params import get_params
from templates._layout import mk_title, drop_content
from templates._text import mk_text


class BandTemperature(Scene):
    def construct(self):
        p = get_params({"title": "Band vs Temperature", "temp_start": "300K", "temp_end": "400K"})
        title = mk_title(p["title"])
        ec = Line(LEFT * 5, RIGHT * 5, color=BLUE).shift(UP * 1.2)
        ev = Line(LEFT * 5, RIGHT * 5, color=RED).shift(DOWN * 1.2)
        gap = mk_text("Eg", font_size=28).move_to(ORIGIN)
        t0 = mk_text(p["temp_start"], font_size=22).to_corner(DL)
        t1 = mk_text(p["temp_end"], font_size=22).to_corner(DR)
        body = VGroup(ec, ev, gap, t0, t1)
        drop_content(body)
        self.play(Write(title), Create(ec), Create(ev), Write(gap), Write(t0))
        self.play(ec.animate.shift(DOWN * 0.3), ev.animate.shift(UP * 0.3), gap.animate.scale(0.7), Transform(t0, t1))
        self.wait(1)
