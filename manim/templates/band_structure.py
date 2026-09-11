import importlib.util
import os
_spec = importlib.util.spec_from_file_location('templates._path', os.path.join(os.path.dirname(__file__), '_path.py'))
_path_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_path_mod)

from manim import *
from templates._text import mk_text


class BandStructure(Scene):
    def construct(self):
        conduction = Line(LEFT * 5, RIGHT * 5, color=BLUE).shift(UP * 1.5)
        valence = Line(LEFT * 5, RIGHT * 5, color=RED).shift(DOWN * 1.5)
        gap_label = mk_text("Eg", font_size=28).move_to(ORIGIN)

        ec_label = mk_text("Ec", font_size=24, color=BLUE).next_to(conduction, LEFT)
        ev_label = mk_text("Ev", font_size=24, color=RED).next_to(valence, LEFT)

        electron = Dot(color=YELLOW).move_to(conduction.get_center() + LEFT * 2)
        hole = Dot(color=GREEN).move_to(valence.get_center() + RIGHT * 2)

        self.play(Create(conduction), Create(valence))
        self.play(Write(ec_label), Write(ev_label), Write(gap_label))
        self.play(FadeIn(electron), FadeIn(hole))
        self.play(
            electron.animate.move_to(conduction.get_center() + RIGHT * 2),
            hole.animate.move_to(valence.get_center() + LEFT * 2),
        )
        self.wait(1)
