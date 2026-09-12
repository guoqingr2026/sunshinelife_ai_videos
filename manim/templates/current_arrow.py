import importlib.util
import os
_spec = importlib.util.spec_from_file_location('templates._path', os.path.join(os.path.dirname(__file__), '_path.py'))
_path_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_path_mod)

from manim import *
from templates._no_tex import apply_no_tex
apply_no_tex()

from templates._text import mk_text


class CurrentArrow(Scene):
    def construct(self):
        resistor = Rectangle(width=3, height=1, color=WHITE)
        r_label = mk_text("R", font_size=36).move_to(resistor)

        wire_left = Line(LEFT * 5, resistor.get_left(), color=WHITE)
        wire_right = Line(resistor.get_right(), RIGHT * 5, color=WHITE)

        arrow = Arrow(LEFT * 4, RIGHT * 4, color=YELLOW, buff=0)
        i_label = mk_text("I", font_size=28, color=YELLOW).next_to(arrow, UP)

        voltage = mk_text("V = 9V", font_size=24).to_corner(UL)

        self.play(Create(wire_left), Create(wire_right), Create(resistor))
        self.play(Write(r_label), Write(voltage))
        self.play(GrowArrow(arrow), Write(i_label))
        self.wait(1)
