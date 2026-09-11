from manim import *
from templates._params import get_params


class TimelineHorizontal(Scene):
    def construct(self):
        p = get_params({"events": ["起点", "阶段1", "阶段2", "终点"]})
        events = p["events"]
        line = Line(LEFT * 5, RIGHT * 5, color=WHITE)
        dots = VGroup()
        labels = VGroup()
        n = len(events)
        for i, ev in enumerate(events):
            x = -5 + (10 * i / max(n - 1, 1))
            dot = Dot(point=[x, 0, 0], color=YELLOW)
            lbl = Text(str(ev), font_size=20).next_to(dot, DOWN, buff=0.3)
            dots.add(dot)
            labels.add(lbl)
        title = Text("时间轴", font_size=32).to_edge(UP)
        self.play(Write(title), Create(line))
        self.play(LaggedStart(*[FadeIn(d) for d in dots], lag_ratio=0.2))
        self.play(LaggedStart(*[Write(l) for l in labels], lag_ratio=0.15))
        self.wait(1)
