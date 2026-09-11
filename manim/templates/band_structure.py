from manim import *


class BandStructure(Scene):
    def construct(self):
        conduction = Line(LEFT * 5, RIGHT * 5, color=BLUE).shift(UP * 1.5)
        valence = Line(LEFT * 5, RIGHT * 5, color=RED).shift(DOWN * 1.5)
        gap_label = Text("Eg", font_size=28).move_to(ORIGIN)

        ec_label = Text("Ec", font_size=24, color=BLUE).next_to(conduction, LEFT)
        ev_label = Text("Ev", font_size=24, color=RED).next_to(valence, LEFT)

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
