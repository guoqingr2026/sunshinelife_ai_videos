import importlib.util
import math
import os

_spec = importlib.util.spec_from_file_location(
    "templates._path", os.path.join(os.path.dirname(__file__), "..", "_path.py")
)
_path_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_path_mod)

from manim import *
from templates._no_tex import apply_no_tex

apply_no_tex()

from templates._curves import build_parametric, build_polar_curve
from templates._params import get_params
from templates._theme import apply_scene_theme
from templates.math_universe._base import play_2d_curve


class ParametricCurveScene(Scene):
    """通用 2D 参数曲线（默认内外摆线）"""

    def construct(self):
        theme = apply_scene_theme(self)
        p = get_params(
            {
                "title": "参数曲线",
                "subtitle": "x=cos(t)+0.5cos(2t), y=sin(t)+0.5sin(2t)",
                "t_min": 0,
                "t_max": None,
            }
        )
        t_max = float(p["t_max"]) if p.get("t_max") is not None else TAU

        def x_fn(t):
            return math.cos(t) + 0.5 * math.cos(2 * t)

        def y_fn(t):
            return math.sin(t) + 0.5 * math.sin(2 * t)

        curve = build_parametric(
            x_fn, y_fn, float(p.get("t_min", 0)), t_max, color=theme.primary
        )
        play_2d_curve(
            self,
            curve,
            str(p.get("title", "参数曲线")),
            str(p.get("subtitle", "")),
            theme,
        )


class RoseCurveScene(Scene):
    def construct(self):
        theme = apply_scene_theme(self)
        p = get_params({"title": "玫瑰线", "k": 5, "subtitle": "r = sin(kθ)"})
        k = float(p.get("k", 5))
        curve = build_polar_curve(
            lambda t: math.sin(k * t), 0, TAU, color=theme.primary
        )
        sub = str(p.get("subtitle") or f"r = sin({k:g}θ)")
        play_2d_curve(self, curve, str(p.get("title", "玫瑰线")), sub, theme)


class CardioidScene(Scene):
    def construct(self):
        theme = apply_scene_theme(self)
        p = get_params({"title": "心形线", "subtitle": "r = 1 - cos θ"})
        curve = build_polar_curve(
            lambda t: 1 - math.cos(t), 0, TAU, color=theme.primary
        )
        play_2d_curve(
            self, curve, str(p.get("title", "心形线")), str(p.get("subtitle", "")), theme
        )


class ArchimedeanSpiralScene(Scene):
    def construct(self):
        theme = apply_scene_theme(self)
        p = get_params({"title": "阿基米德螺线", "a": 0.1, "b": 0.2, "subtitle": "r = a + bθ"})
        a = float(p.get("a", 0.1))
        b = float(p.get("b", 0.2))
        curve = build_polar_curve(
            lambda t: a + b * t, 0, 20, color=theme.secondary
        )
        play_2d_curve(
            self,
            curve,
            str(p.get("title", "阿基米德螺线")),
            str(p.get("subtitle", "")),
            theme,
        )


class EpicycloidScene(Scene):
    def construct(self):
        theme = apply_scene_theme(self)
        p = get_params({"title": "星形线 / 摆线族", "R": 3, "r": 1, "subtitle": "外摆线"})
        R = float(p.get("R", 3))
        r = float(p.get("r", 1))

        def x_fn(t):
            return (R + r) * math.cos(t) - r * math.cos((R + r) / r * t)

        def y_fn(t):
            return (R + r) * math.sin(t) - r * math.sin((R + r) / r * t)

        curve = build_parametric(x_fn, y_fn, 0, TAU, color=theme.accent)
        play_2d_curve(
            self, curve, str(p.get("title", "外摆线")), str(p.get("subtitle", "")), theme
        )


class LissajousScene(Scene):
    def construct(self):
        theme = apply_scene_theme(self)
        p = get_params({"title": "李萨如图形", "a": 3, "b": 4, "subtitle": "x=sin(aθ), y=sin(bθ)"})
        a = float(p.get("a", 3))
        b = float(p.get("b", 4))
        curve = build_parametric(
            lambda t: math.sin(a * t),
            lambda t: math.sin(b * t),
            0,
            TAU,
            color=theme.primary,
        )
        play_2d_curve(
            self,
            curve,
            str(p.get("title", "李萨如图形")),
            str(p.get("subtitle", "")),
            theme,
        )
