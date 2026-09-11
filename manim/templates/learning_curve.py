from manim import *
from templates._params import get_params


class LearningCurve(Scene):
    def construct(self):
        p = get_params({"title": "学习效率曲线"})
        axes = Axes(x_range=[0, 10, 2], y_range=[0, 1, 0.25], x_length=8, y_length=4)
        curve = axes.plot(lambda x: 1 - __import__("math").exp(-0.5 * x), color=GREEN)
        title = Text(p["title"], font_size=32).to_edge(UP)
        hint = Text("理解优先 → 长期留存", font_size=22, color=YELLOW).to_edge(DOWN)
        self.play(Write(title), Create(axes))
        self.play(Create(curve), Write(hint))
        self.wait(1)
