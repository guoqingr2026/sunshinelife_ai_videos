import numpy as np
from manim import *
from templates._params import get_params


class ConceptNetwork(Scene):
    def construct(self):
        p = get_params({"center": "核心概念", "nodes": ["A", "B", "C", "D"]})
        center = Circle(radius=0.6, color=YELLOW, fill_opacity=0.3)
        c_txt = Text(p["center"], font_size=18).move_to(center)
        nodes = VGroup()
        lines = VGroup()
        angles = [0, PI / 2, PI, 3 * PI / 2]
        for i, name in enumerate(p["nodes"][:4]):
            ang = angles[i % 4]
            pos = 2.5 * np.array([np.cos(ang), np.sin(ang), 0])
            n = Circle(radius=0.45, color=BLUE, fill_opacity=0.2).move_to(pos)
            t = Text(str(name), font_size=18).move_to(n)
            nodes.add(VGroup(n, t))
            lines.add(Line(center.get_center(), n.get_center(), color=WHITE, stroke_opacity=0.6))
        title = Text("概念网络", font_size=32).to_edge(UP)
        self.play(Write(title), FadeIn(center), Write(c_txt))
        self.play(Create(lines), LaggedStart(*[FadeIn(n) for n in nodes], lag_ratio=0.2))
        self.wait(1)
