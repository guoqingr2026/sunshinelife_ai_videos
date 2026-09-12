import importlib.util
import os
_spec = importlib.util.spec_from_file_location('templates._path', os.path.join(os.path.dirname(__file__), '_path.py'))
_path_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_path_mod)

from manim import *
from templates._no_tex import apply_no_tex
apply_no_tex()

from templates._params import get_params
from templates._layout import mk_title
from templates._text import mk_text


class Scene3DOrbit(ThreeDScene):
    def construct(self):
        p = get_params({"title": "3D Orbit", "label": "Orbit"})
        title = mk_title(p["title"])
        self.add_fixed_in_frame_mobjects(title)
        axes = ThreeDAxes()
        orbit = Circle(radius=2, color=YELLOW)
        dot = Dot3D(point=[2, 0, 0], radius=0.08, color=RED)
        lbl = mk_text(p["label"], font_size=22)
        lbl.to_corner(DR)
        self.add_fixed_in_frame_mobjects(lbl)
        self.set_camera_orientation(phi=65 * DEGREES, theta=30 * DEGREES)
        self.play(Write(title), Create(axes), Create(orbit), FadeIn(dot))
        self.play(MoveAlongPath(dot, orbit), run_time=3)
        self.wait(0.5)
