import importlib.util
import os
_spec = importlib.util.spec_from_file_location('templates._path', os.path.join(os.path.dirname(__file__), '_path.py'))
_path_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_path_mod)

from manim import *
from templates._text import mk_text
from templates._params import get_params
from templates._layout import mk_title, drop_content


class TimelineHorizontal(Scene):
    def construct(self):
        p = get_params({"events": ["Start", "Phase 1", "Phase 2", "End"], "title": "Timeline"})
        events = p["events"]
        title = mk_title(p["title"])
        line = Line(LEFT * 5, RIGHT * 5, color=WHITE)
        dots = VGroup()
        labels = VGroup()
        n = len(events)
        for i, ev in enumerate(events):
            x = -5 + (10 * i / max(n - 1, 1))
            dot = Dot(point=[x, 0, 0], color=YELLOW)
            lbl = mk_text(str(ev), font_size=20).next_to(dot, DOWN, buff=0.35)
            dots.add(dot)
            labels.add(lbl)
        timeline = VGroup(line, dots, labels)
        drop_content(timeline)
        self.play(Write(title), Create(line))
        self.play(LaggedStart(*[FadeIn(d) for d in dots], lag_ratio=0.2))
        self.play(LaggedStart(*[Write(l) for l in labels], lag_ratio=0.15))
        self.wait(1)
