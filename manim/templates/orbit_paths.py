import importlib.util
import os
_spec = importlib.util.spec_from_file_location('templates._path', os.path.join(os.path.dirname(__file__), '_path.py'))
_path_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_path_mod)

from manim import *
from templates._params import get_params
from templates._layout import mk_title, drop_content


class OrbitPaths(Scene):
    def construct(self):
        p = get_params({"title": "Orbit Paths"})
        title = mk_title(p["title"], font_size=28)
        center = Dot(color=YELLOW)
        orbit = Circle(radius=2.2, color=WHITE, stroke_opacity=0.45)
        mover = Dot(color=RED).move_to(orbit.point_at_angle(0))
        body = VGroup(center, orbit, mover)
        drop_content(body)
        self.play(Write(title), Create(orbit), FadeIn(center))
        self.play(FadeIn(mover))
        self.play(MoveAlongPath(mover, orbit), run_time=3, rate_func=linear)
        self.wait(0.5)
