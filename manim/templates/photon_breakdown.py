from manim import *
from templates._text import mk_text


class PhotonBreakdown(Scene):
    def construct(self):
        atom = Circle(radius=0.5, color=BLUE)
        nucleus = Dot(color=RED).move_to(atom)
        electron = Dot(color=YELLOW).move_to(atom.get_center() + RIGHT * 0.8)

        photon = Arrow(
            UP * 3 + LEFT * 2,
            atom.get_center() + UP * 0.3,
            color=GREEN,
            buff=0.1,
        )
        photon_label = mk_text("hν", font_size=24, color=GREEN).next_to(photon, LEFT)

        self.play(Create(atom), FadeIn(nucleus), FadeIn(electron))
        self.play(GrowArrow(photon), Write(photon_label))
        self.play(
            electron.animate.move_to(atom.get_center() + RIGHT * 3),
            photon.animate.set_opacity(0),
        )
        self.wait(1)
