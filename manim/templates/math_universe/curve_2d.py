import cmath
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
            params=p,
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
        play_2d_curve(self, curve, str(p.get("title", "玫瑰线")), sub, theme, params=p)


class CardioidScene(Scene):
    def construct(self):
        theme = apply_scene_theme(self)
        p = get_params({"title": "心形线", "subtitle": "r = 1 - cos θ"})
        curve = build_polar_curve(
            lambda t: 1 - math.cos(t), 0, TAU, color=theme.primary
        )
        play_2d_curve(
            self, curve, str(p.get("title", "心形线")), str(p.get("subtitle", "")), theme, params=p
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
            params=p,
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
            self,
            curve,
            str(p.get("title", "外摆线")),
            str(p.get("subtitle", "")),
            theme,
            params=p,
        )


class SpirographScene(Scene):
    """内旋轮线 / 万花筒（hypotrochoid）"""

    def construct(self):
        theme = apply_scene_theme(self)
        p = get_params(
            {
                "title": "万花筒曲线",
                "subtitle": "内旋轮 · Spirograph",
                "R": 3,
                "r": 1,
                "d": 2,
                "t_max": 50,
            }
        )
        R = float(p.get("R", 3))
        r = float(p.get("r", 1))
        d = float(p.get("d", 2))
        t_max = float(p.get("t_max", 50))
        ratio = (R - r) / r

        def x_fn(t):
            return (R - r) * math.cos(t) + d * math.cos(ratio * t)

        def y_fn(t):
            return (R - r) * math.sin(t) - d * math.sin(ratio * t)

        curve = build_parametric(x_fn, y_fn, 0, t_max, color=theme.accent, n=600)
        play_2d_curve(
            self,
            curve,
            str(p.get("title", "万花筒曲线")),
            str(p.get("subtitle", "")),
            theme,
            params=p,
        )


class HarmonicCurveScene(Scene):
    """多频谐波叠加平面曲线"""

    def construct(self):
        theme = apply_scene_theme(self)
        p = get_params(
            {
                "title": "谐波叠加",
                "subtitle": "多频李萨如",
                "t_max": 20,
            }
        )
        t_max = float(p.get("t_max", 20))
        curve = build_parametric(
            lambda t: math.sin(3 * t) + 0.5 * math.sin(5 * t),
            lambda t: math.cos(4 * t) + 0.5 * math.cos(6 * t),
            0,
            t_max,
            color=theme.primary,
            n=500,
        )
        play_2d_curve(
            self,
            curve,
            str(p.get("title", "谐波叠加")),
            str(p.get("subtitle", "")),
            theme,
            params=p,
        )


class IteratedFlowerScene(Scene):
    """极坐标迭代花朵"""

    def construct(self):
        theme = apply_scene_theme(self)
        p = get_params(
            {
                "title": "迭代花朵",
                "subtitle": "r = sin(5θ)·cos(3θ)",
                "petals_a": 5,
                "petals_b": 3,
            }
        )
        a = float(p.get("petals_a", 5))
        b = float(p.get("petals_b", 3))
        curve = build_polar_curve(
            lambda t: math.sin(a * t) * math.cos(b * t),
            0,
            TAU,
            color=theme.secondary,
            n=500,
        )
        sub = str(p.get("subtitle") or f"r = sin({a:g}θ)·cos({b:g}θ)")
        play_2d_curve(
            self,
            curve,
            str(p.get("title", "迭代花朵")),
            sub,
            theme,
            params=p,
        )


class ComplexCurveScene(Scene):
    """复平面参数曲线"""

    def construct(self):
        theme = apply_scene_theme(self)
        p = get_params(
            {
                "title": "复平面曲线",
                "subtitle": "z = e^{it} + 0.5e^{3it}",
                "t_max": 20,
                "harmonic": 3,
                "coeff": 0.5,
            }
        )
        t_max = float(p.get("t_max", 20))
        h = float(p.get("harmonic", 3))
        coeff = float(p.get("coeff", 0.5))

        def x_fn(t):
            z = cmath.exp(1j * t) + coeff * cmath.exp(h * 1j * t)
            return z.real

        def y_fn(t):
            z = cmath.exp(1j * t) + coeff * cmath.exp(h * 1j * t)
            return z.imag

        curve = build_parametric(x_fn, y_fn, 0, t_max, color=theme.accent, n=500)
        play_2d_curve(
            self,
            curve,
            str(p.get("title", "复平面曲线")),
            str(p.get("subtitle", "")),
            theme,
            params=p,
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
            params=p,
        )
