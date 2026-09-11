from manim import *
from templates._text import mk_text


class PNJunction(Scene):
    def construct(self):
        n_region = Rectangle(width=4, height=2, color=BLUE, fill_opacity=0.3)
        n_label = mk_text("N", font_size=36).move_to(n_region)
        p_region = Rectangle(width=4, height=2, color=RED, fill_opacity=0.3).next_to(
            n_region, RIGHT, buff=0
        )
        p_label = mk_text("P", font_size=36).move_to(p_region)

        depletion = Rectangle(width=0.5, height=2, color=YELLOW, fill_opacity=0.5)
        depletion.move_to(Line(n_region.get_right(), p_region.get_left()).get_center())

        arrow = Arrow(
            n_region.get_center() + DOWN * 1.5,
            p_region.get_center() + DOWN * 1.5,
            color=WHITE,
        )
        current_label = mk_text("I", font_size=24).next_to(arrow, DOWN)

        self.play(FadeIn(n_region), FadeIn(p_region))
        self.play(Write(n_label), Write(p_label))
        self.play(FadeIn(depletion))
        self.play(GrowArrow(arrow), Write(current_label))
        self.wait(1)
