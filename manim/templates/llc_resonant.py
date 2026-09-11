from manim import *


class LLCResonant(Scene):
    def construct(self):
        pri = Rectangle(width=1.5, height=2, color=BLUE, fill_opacity=0.3).shift(LEFT * 2)
        sec = Rectangle(width=1.5, height=2, color=GREEN, fill_opacity=0.3).shift(RIGHT * 2)
        cr = Text("Cr", font_size=24, color=YELLOW).shift(UP * 0.5)
        lr = Text("Lr", font_size=24, color=ORANGE).shift(DOWN * 0.5)
        title = Text("LLC 谐振腔", font_size=28).to_edge(UP)
        self.play(Write(title))
        self.play(FadeIn(pri), FadeIn(sec), Write(cr), Write(lr))
        arrow = DoubleArrow(pri.get_right(), sec.get_left(), buff=0.1, color=WHITE)
        self.play(GrowArrow(arrow))
        self.wait(1)
