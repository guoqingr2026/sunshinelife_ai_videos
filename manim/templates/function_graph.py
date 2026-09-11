from manim import *
from templates._params import get_params


class FunctionGraphScene(Scene):
    def construct(self):
        p = get_params({"title": "y = sin(x)", "label": "sin(x)"})
        axes = Axes(x_range=[-3, 3, 1], y_range=[-1.5, 1.5, 0.5], x_length=9, y_length=5)
        graph = axes.plot(lambda x: __import__("math").sin(x), color=YELLOW)
        label = Text(p["label"], font_size=28, color=YELLOW).to_corner(UR)
        title = Text(p["title"], font_size=32).to_edge(UP)
        self.play(Write(title), Create(axes))
        self.play(Create(graph), FadeIn(label))
        self.wait(1)
