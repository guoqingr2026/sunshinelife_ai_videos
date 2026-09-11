from manim import *
from templates._params import get_params


class VectorSum(Scene):
    def construct(self):
        p = get_params({"title": "向量合成"})
        o = ORIGIN
        v1 = Arrow(o, RIGHT * 2 + UP, buff=0, color=BLUE)
        v2 = Arrow(o, RIGHT * 1.5 + DOWN * 1.2, buff=0, color=GREEN)
        vr = Arrow(o, RIGHT * 2 + UP + RIGHT * 1.5 + DOWN * 1.2, buff=0, color=YELLOW)
        t1 = Text("a", font_size=24, color=BLUE).next_to(v1, UP)
        t2 = Text("b", font_size=24, color=GREEN).next_to(v2, DOWN)
        title = Text(p["title"], font_size=32).to_edge(UP)
        self.play(Write(title))
        self.play(GrowArrow(v1), GrowArrow(v2), Write(t1), Write(t2))
        self.play(GrowArrow(vr))
        self.wait(1)
