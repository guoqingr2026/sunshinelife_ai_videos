import importlib.util
import os
_spec = importlib.util.spec_from_file_location('templates._path', os.path.join(os.path.dirname(__file__), '_path.py'))
_path_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_path_mod)

from manim import *
from templates._text import mk_text
import numpy as np


class OrbitPaths(Scene):
    """轨道路径示意�?D 投影，cairo 友好�?""

    def construct(self):
        center = Dot(color=YELLOW)
        orbit = Circle(radius=2.5, color=WHITE, stroke_opacity=0.4)
        mover = Dot(color=RED).move_to(orbit.point_at_angle(0))
        title = mk_text("轨道 / 旋转路径", font_size=28).to_edge(UP)
        self.play(Write(title), Create(orbit), FadeIn(center))
        self.play(FadeIn(mover))
        self.play(MoveAlongPath(mover, orbit), run_time=3, rate_func=linear)
        self.wait(0.5)
