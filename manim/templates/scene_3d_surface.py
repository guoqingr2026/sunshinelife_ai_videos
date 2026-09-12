import importlib.util
import os
_spec = importlib.util.spec_from_file_location('templates._path', os.path.join(os.path.dirname(__file__), '_path.py'))
_path_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_path_mod)

import numpy as np
from manim import *
from templates._no_tex import apply_no_tex
apply_no_tex()

from templates._params import get_params
from templates._layout import mk_title
from templates._text import mk_text


class Scene3DSurface(ThreeDScene):
    def construct(self):
        p = get_params({"title": "3D Surface"})
        title = mk_title(p["title"])
        self.add_fixed_in_frame_mobjects(title)
        axes = ThreeDAxes(x_range=[-3, 3, 1], y_range=[-3, 3, 1], z_range=[0, 4, 1])
        surface = Surface(
            lambda u, v: np.array([u, v, 0.3 * (u ** 2 + v ** 2)]),
            u_range=[-2, 2],
            v_range=[-2, 2],
            resolution=(12, 12),
            fill_opacity=0.7,
            checkerboard_colors=[BLUE_D, BLUE_E],
        )
        self.set_camera_orientation(phi=70 * DEGREES, theta=-40 * DEGREES)
        self.play(Write(title), Create(surface))
        self.begin_ambient_camera_rotation(rate=0.15)
        self.wait(3)
        self.stop_ambient_camera_rotation()
