import importlib.util
import os

import numpy as np

_spec = importlib.util.spec_from_file_location(
    "templates._path", os.path.join(os.path.dirname(__file__), "_path.py")
)
_path_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_path_mod)

from manim import *
from templates._no_tex import apply_no_tex

apply_no_tex()

from templates._curves import build_parametric, build_polar_curve
from templates._formula_eval import eval_curve_expr
from templates._params import get_params
from templates._theme import apply_scene_theme
from templates.math_universe._base import play_2d_curve, play_3d_intro


def _subtitle_for_mode(mode: str, p: dict) -> str:
    if mode == "polar_2d":
        r = p.get("r", "sin(5*t)")
        return str(p.get("subtitle") or f"r = {r}")
    if mode == "parametric_3d":
        x, y, z = p.get("x", "sin(t)"), p.get("y", "cos(t)"), p.get("z", "0")
        return str(p.get("subtitle") or f"x={x}, y={y}, z={z}")
    x, y = p.get("x", "sin(t)"), p.get("y", "cos(t)")
    return str(p.get("subtitle") or f"x={x}, y={y}")


class FormulaCurveScene(Scene):
    """公式曲线 · 2D 参数 / 极坐标"""

    def construct(self):
        theme = apply_scene_theme(self)
        p = get_params(
            {
                "title": "公式曲线",
                "subtitle": "",
                "mode": "parametric_2d",
                "x": "sin(3*t)",
                "y": "cos(4*t)",
                "r": "sin(5*t)*cos(3*t)",
                "t_min": 0,
                "t_max": 6.28318,
            }
        )
        mode = str(p.get("mode", "parametric_2d"))
        t_min = float(p.get("t_min", 0))
        t_max = float(p.get("t_max", 6.28318))
        sub = _subtitle_for_mode(mode, p)

        if mode == "polar_2d":
            r_expr = str(p.get("r", "sin(5*t)"))
            curve = build_polar_curve(
                lambda t: eval_curve_expr(r_expr, t),
                t_min,
                t_max,
                color=theme.primary,
                n=500,
            )
        else:
            x_expr = str(p.get("x", "sin(3*t)"))
            y_expr = str(p.get("y", "cos(4*t)"))
            curve = build_parametric(
                lambda t: eval_curve_expr(x_expr, t),
                lambda t: eval_curve_expr(y_expr, t),
                t_min,
                t_max,
                color=theme.primary,
                n=500,
            )

        play_2d_curve(
            self,
            curve,
            str(p.get("title", "公式曲线")),
            sub,
            theme,
            params=p,
        )


class FormulaCurve3DScene(ThreeDScene):
    """公式曲线 · 3D 参数"""

    def construct(self):
        p = get_params(
            {
                "title": "3D 公式曲线",
                "subtitle": "",
                "mode": "parametric_3d",
                "x": "sin(2*t) + 0.3*sin(5*t)",
                "y": "cos(3*t) + 0.3*cos(7*t)",
                "z": "0.6*sin(4*t)",
                "t_min": 0,
                "t_max": 20,
            }
        )
        t_min = float(p.get("t_min", 0))
        t_max = float(p.get("t_max", 20))
        x_expr = str(p.get("x", "sin(t)"))
        y_expr = str(p.get("y", "cos(t)"))
        z_expr = str(p.get("z", "0"))
        axes = ThreeDAxes()

        def curve(t):
            return np.array(
                [
                    eval_curve_expr(x_expr, t),
                    eval_curve_expr(y_expr, t),
                    eval_curve_expr(z_expr, t),
                ]
            )

        graph = ParametricFunction(curve, t_range=[t_min, t_max], color=YELLOW)
        play_3d_intro(
            self,
            VGroup(axes, graph),
            str(p.get("title", "3D 公式曲线")),
            _subtitle_for_mode("parametric_3d", p),
            params=p,
        )
