import importlib.util
import os
_spec = importlib.util.spec_from_file_location('templates._path', os.path.join(os.path.dirname(__file__), '_path.py'))
_path_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_path_mod)

from manim import *
from templates._text import mk_text
from templates._params import get_params
from templates._layout import mk_title, drop_content


class MosfetChannel(Scene):
    def construct(self):
        p = get_params({"title": "MOSFET Channel"})
        title = mk_title(p["title"])
        gate = Rectangle(width=1.2, height=3, color=YELLOW, fill_opacity=0.3)
        source = Rectangle(width=2, height=0.4, color=BLUE, fill_opacity=0.5).next_to(gate, LEFT, buff=0)
        drain = Rectangle(width=2, height=0.4, color=BLUE, fill_opacity=0.5).next_to(gate, RIGHT, buff=0)
        channel = Rectangle(width=2.5, height=0.3, color=GREEN, fill_opacity=0.4).move_to(gate.get_center() + DOWN * 0.8)
        labels = VGroup(
            mk_text("G", font_size=24).next_to(gate, UP),
            mk_text("S", font_size=24).next_to(source, LEFT),
            mk_text("D", font_size=24).next_to(drain, RIGHT),
        )
        body = VGroup(gate, source, drain, channel, labels)
        drop_content(body)
        self.play(Write(title))
        self.play(FadeIn(gate), FadeIn(source), FadeIn(drain), FadeIn(channel))
        self.play(Write(labels))
        self.wait(1)
