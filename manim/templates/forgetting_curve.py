from manim import *
from templates._text import mk_text
from templates._params import get_params


class ForgettingCurve(Scene):
    def construct(self):
        p = get_params({"title": "遗忘曲线"})
        axes = Axes(x_range=[0, 10, 2], y_range=[0, 1, 0.25], x_length=8, y_length=4)
        curve = axes.plot(lambda x: 0.95 * __import__("math").exp(-0.35 * x), color=RED)
        x_lbl = mk_text("时间", font_size=20).next_to(axes, DOWN)
        y_lbl = mk_text("记忆保留", font_size=20).next_to(axes, LEFT)
        title = mk_text(p["title"], font_size=32).to_edge(UP)
        self.play(Write(title), Create(axes), Write(x_lbl), Write(y_lbl))
        self.play(Create(curve))
        self.wait(1)
