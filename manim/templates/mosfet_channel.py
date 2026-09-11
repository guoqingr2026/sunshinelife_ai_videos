from manim import *


class MosfetChannel(Scene):
    def construct(self):
        gate = Rectangle(width=1.2, height=3, color=YELLOW, fill_opacity=0.3)
        source = Rectangle(width=2, height=0.4, color=BLUE, fill_opacity=0.5).next_to(gate, LEFT, buff=0)
        drain = Rectangle(width=2, height=0.4, color=BLUE, fill_opacity=0.5).next_to(gate, RIGHT, buff=0)
        channel = Rectangle(width=2.5, height=0.3, color=GREEN, fill_opacity=0.4).move_to(gate.get_center() + DOWN * 0.8)
        labels = VGroup(
            Text("G", font_size=24).next_to(gate, UP),
            Text("S", font_size=24).next_to(source, LEFT),
            Text("D", font_size=24).next_to(drain, RIGHT),
        )
        title = Text("MOSFET 沟道", font_size=28).to_edge(UP)
        self.play(Write(title))
        self.play(FadeIn(gate), FadeIn(source), FadeIn(drain), FadeIn(channel))
        self.play(Write(labels))
        self.wait(1)
