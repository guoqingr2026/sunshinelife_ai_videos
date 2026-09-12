import importlib.util
import os
_spec = importlib.util.spec_from_file_location('templates._path', os.path.join(os.path.dirname(__file__), '_path.py'))
_path_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_path_mod)

from manim import *
from templates._text import mk_text
from templates._params import get_params
from templates._layout import drop_content


class PhotonBreakdown(Scene):
    def construct(self):
        p = get_params({"photon_label": "hv"})
        atom = Circle(radius=0.5, color=BLUE)
        nucleus = Dot(color=RED).move_to(atom)
        electron = Dot(color=YELLOW).move_to(atom.get_center() + RIGHT * 0.8)
        photon = Arrow(UP * 3 + LEFT * 2, atom.get_center() + UP * 0.3, color=GREEN, buff=0.1)
        photon_label = mk_text(p["photon_label"], font_size=24, color=GREEN).next_to(photon, LEFT)
        body = VGroup(atom, nucleus, electron, photon, photon_label)
        drop_content(body)
        self.play(Create(atom), FadeIn(nucleus), FadeIn(electron))
        self.play(GrowArrow(photon), Write(photon_label))
        self.play(electron.animate.move_to(atom.get_center() + RIGHT * 3), FadeOut(photon))
        self.wait(1)
