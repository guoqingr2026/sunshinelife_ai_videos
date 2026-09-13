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

from templates._params import get_params
from templates.math_universe._base import play_3d_intro


class SurfaceScene(ThreeDScene):
    """参数曲面 z = sin(u)cos(v)"""

    def construct(self):
        p = get_params({"title": "参数曲面", "subtitle": "z = sin(u)·cos(v)"})
        surface = Surface(
            lambda u, v: np.array([u, v, np.sin(u) * np.cos(v)]),
            u_range=[-3, 3],
            v_range=[-3, 3],
            resolution=(24, 24),
        )
        surface.set_style(fill_opacity=0.7, stroke_color=WHITE, stroke_width=0.5)
        play_3d_intro(
            self,
            surface,
            str(p.get("title", "参数曲面")),
            str(p.get("subtitle", "")),
            params=p,
        )


class SaddleSurfaceScene(ThreeDScene):
    """鞍面 z = u² - v²"""

    def construct(self):
        p = get_params({"title": "鞍面", "subtitle": "z = u² - v²"})
        surface = Surface(
            lambda u, v: np.array([u, v, u * u - v * v]),
            u_range=[-2, 2],
            v_range=[-2, 2],
            resolution=(20, 20),
        )
        surface.set_style(fill_opacity=0.65, stroke_color=GRAY)
        play_3d_intro(
            self,
            surface,
            str(p.get("title", "鞍面")),
            str(p.get("subtitle", "")),
            params=p,
        )
