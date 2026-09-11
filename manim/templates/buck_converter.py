from manim import *


class BuckConverter(Scene):
    def construct(self):
        vin = Text("Vin", font_size=24).shift(LEFT * 5 + UP)
        sw = Square(side_length=0.6, color=YELLOW).shift(LEFT * 2)
        l = Text("L", font_size=28, color=GREEN).shift(ORIGIN)
        c = Text("C", font_size=28, color=BLUE).shift(RIGHT * 2)
        vout = Text("Vout", font_size=24).shift(RIGHT * 5 + DOWN)
        path = VGroup(
            Line(vin.get_center(), sw.get_center(), color=WHITE),
            Line(sw.get_center(), l.get_center(), color=WHITE),
            Line(l.get_center(), c.get_center(), color=WHITE),
            Line(c.get_center(), vout.get_center(), color=WHITE),
        )
        title = Text("Buck 降压拓扑", font_size=28).to_edge(UP)
        self.play(Write(title))
        self.play(Write(vin), FadeIn(sw), Write(l), Write(c), Write(vout))
        self.play(Create(path))
        self.wait(1)
