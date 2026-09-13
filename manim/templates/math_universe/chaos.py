import importlib.util
import os

_spec = importlib.util.spec_from_file_location(
    "templates._path", os.path.join(os.path.dirname(__file__), "..", "_path.py")
)
_path_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_path_mod)

from manim import *
from templates._no_tex import apply_no_tex

apply_no_tex()

from templates._curves import build_lorenz_gradient_path, build_lorenz_group
from templates._params import get_params
from templates._theme import apply_scene_theme
from templates.math_universe._base import play_3d_intro


def _build_rossler_path(steps=5000, dt=0.02, scale=0.12):
    x, y, z = 0.1, 0.0, 0.0
    pts = []
    for _ in range(steps):
        dx = -y - z
        dy = x + 0.2 * y
        dz = 0.2 + z * (x - 5.7)
        x += dx * dt
        y += dy * dt
        z += dz * dt
        pts.append([x * scale, y * scale, z * scale - 1])
    curve = VMobject()
    curve.set_points_smoothly(pts)
    return curve


class LorenzScene(ThreeDScene):
    """洛伦兹吸引子（混沌系统骨架）"""

    def construct(self):
        theme = apply_scene_theme(self)
        p = get_params({"title": "洛伦兹吸引子", "subtitle": "混沌中的蝴蝶"})
        paths = build_lorenz_group(p, theme)
        axes = ThreeDAxes(x_length=5, y_length=5, z_length=4)
        play_3d_intro(
            self,
            VGroup(axes, paths),
            str(p.get("title", "洛伦兹吸引子")),
            str(p.get("subtitle", "")),
            params=p,
        )


class ColorLorenz3D(ThreeDScene):
    """洛伦兹吸引子 · 单轨渐变（混沌光轨）"""

    def construct(self):
        p = get_params(
            {
                "title": "渐变洛伦兹",
                "subtitle": "混沌光轨",
                "steps": 8000,
                "dt": 0.01,
            }
        )
        path = build_lorenz_gradient_path(
            steps=int(p.get("steps", 8000)),
            dt=float(p.get("dt", 0.01)),
        )
        axes = ThreeDAxes(x_length=5, y_length=5, z_length=4)
        play_3d_intro(
            self,
            VGroup(axes, path),
            str(p.get("title", "渐变洛伦兹")),
            str(p.get("subtitle", "")),
            params=p,
        )


class RosslerScene(ThreeDScene):
    """Rössler 吸引子"""

    def construct(self):
        theme = apply_scene_theme(self)
        p = get_params({"title": "Rössler 吸引子", "subtitle": "混沌振子"})
        path = _build_rossler_path()
        path.set_color(theme.secondary)
        axes = ThreeDAxes(x_length=5, y_length=5, z_length=4)
        play_3d_intro(
            self,
            VGroup(axes, path),
            str(p.get("title", "Rössler 吸引子")),
            str(p.get("subtitle", "")),
            params=p,
        )
