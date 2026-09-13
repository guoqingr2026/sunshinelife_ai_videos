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


class Curve3DScene(ThreeDScene):
    """3D 坐标系 + 参数曲线轨迹"""

    def construct(self):
        p = get_params(
            {
                "title": "3D 空间曲线",
                "subtitle": "螺旋上升轨迹",
                "t_max": 20,
            }
        )
        t_max = float(p.get("t_max", 20))
        axes = ThreeDAxes(x_range=[-2, 2, 1], y_range=[-2, 2, 1], z_range=[-1, 4, 1])

        def curve(t):
            return np.array([np.sin(t), np.cos(t), t / 5])

        graph = ParametricFunction(curve, t_range=[0, t_max], color=BLUE)
        group = VGroup(axes, graph)
        play_3d_intro(
            self,
            group,
            str(p.get("title", "3D 空间曲线")),
            str(p.get("subtitle", "")),
        )


class Lissajous3DScene(ThreeDScene):
    """3D 李萨如 / 空间曲线"""

    def construct(self):
        p = get_params({"title": "3D 李萨如", "a": 3, "b": 4, "c": 5})
        a, b, c = float(p.get("a", 3)), float(p.get("b", 4)), float(p.get("c", 5))
        axes = ThreeDAxes()

        def curve(t):
            return np.array([np.sin(a * t), np.sin(b * t), np.sin(c * t)])

        graph = ParametricFunction(curve, t_range=[0, TAU], color=PURPLE)
        play_3d_intro(
            self,
            VGroup(axes, graph),
            str(p.get("title", "3D 李萨如")),
            f"sin({a:g}t), sin({b:g}t), sin({c:g}t)",
        )
