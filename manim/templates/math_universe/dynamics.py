import importlib.util
import os

import numpy as np

_spec = importlib.util.spec_from_file_location(
    "templates._path", os.path.join(os.path.dirname(__file__), "..", "_path.py")
)
_path_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_path_mod)

from manim import *
from templates._no_tex import apply_no_tex

apply_no_tex()

from templates._layout import mk_title
from templates._params import get_params
from templates._text import mk_text
from templates._theme import apply_scene_theme


class ThreeBodyScene(Scene):
    """简化三体问题（三质点引力轨迹）"""

    def construct(self):
        theme = apply_scene_theme(self)
        p = get_params({"title": "三体问题", "subtitle": "引力混沌轨迹", "steps": 800})
        title = mk_title(str(p.get("title", "三体问题")))
        self.play(Write(title), run_time=0.6)

        G = 1.0
        dt = 0.008
        steps = int(p.get("steps", 800))
        masses = np.ones(3)
        pos = np.array([[0.5, 0.0], [-0.5, 0.0], [0.0, 0.5]], dtype=float)
        vel = np.array([[0.0, 0.3], [0.0, -0.3], [0.3, 0.0]], dtype=float)

        colors = [theme.primary, theme.secondary, theme.accent]
        dots = VGroup(*[Dot(point=[pos[i, 0], pos[i, 1], 0], color=colors[i], radius=0.08) for i in range(3)])
        trails = VGroup(*[TracedPath(dots[i].get_center, stroke_color=colors[i], stroke_width=2) for i in range(3)])
        self.add(trails, dots)

        def accel(i):
            a = np.zeros(2)
            for j in range(3):
                if i == j:
                    continue
                r = pos[j] - pos[i]
                dist = np.linalg.norm(r) + 1e-3
                a += G * masses[j] * r / (dist ** 3)
            return a

        frame_skip = max(1, steps // 120)
        for step in range(steps):
            for i in range(3):
                vel[i] += accel(i) * dt
            pos += vel * dt
            if step % frame_skip == 0:
                for i in range(3):
                    dots[i].move_to([pos[i, 0], pos[i, 1], 0])
                self.wait(0.02)

        sub = str(p.get("subtitle", ""))
        if sub:
            cap = mk_text(sub, font_size=20, color=theme.muted)
            cap.to_edge(DOWN, buff=0.4)
            self.play(FadeIn(cap))
        self.wait(0.8)
