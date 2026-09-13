import importlib.util
import math
import os

_spec = importlib.util.spec_from_file_location(
    "templates._path", os.path.join(os.path.dirname(__file__), "_path.py")
)
_path_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_path_mod)

from manim import *
from templates._no_tex import apply_no_tex

apply_no_tex()

from templates._curves import (
    build_lorenz_group,
    build_parametric,
    build_polar_curve,
    fit_curve_group,
    mandelbrot_rgba,
)
from templates._layout import drop_content, mk_title
from templates._params import get_params
from templates._text import mk_text
from templates._theme import apply_scene_theme


def _play_curve_scene(self, title_text: str, curve, subtitle: str = "", theme=None):
    if theme is None:
        theme = apply_scene_theme(self)
    else:
        self.camera.background_color = theme.background
    title = mk_title(title_text)
    fit_curve_group(curve)
    drop_content(curve)
    self.play(Write(title), run_time=0.8)
    self.play(Create(curve), run_time=2.2)
    if subtitle:
        cap = mk_text(subtitle, font_size=22, color=theme.muted)
        cap.to_edge(DOWN, buff=0.45)
        self.play(FadeIn(cap))
    self.wait(0.8)


class ManimCardioid(Scene):
    """心形线 r = 1 - cos θ"""

    def construct(self):
        theme = apply_scene_theme(self)
        p = get_params({"title": "心形线", "subtitle": "r = 1 - cos θ"})
        curve = build_polar_curve(
            lambda t: 1 - math.cos(t), 0, TAU, color=theme.primary
        )
        _play_curve_scene(
            self, str(p.get("title", "心形线")), curve, str(p.get("subtitle", "")), theme
        )


class ManimRoseCurve(Scene):
    """玫瑰线 r = sin(kθ)"""

    def construct(self):
        theme = apply_scene_theme(self)
        p = get_params({"title": "玫瑰线", "k": 5, "subtitle": "r = sin(kθ)"})
        k = float(p.get("k", 5))
        curve = build_polar_curve(
            lambda t: math.sin(k * t), 0, TAU, color=theme.primary
        )
        sub = str(p.get("subtitle") or f"r = sin({k:g}θ)")
        _play_curve_scene(self, str(p.get("title", "玫瑰线")), curve, sub, theme)


class ManimArchimedeanSpiral(Scene):
    """阿基米德螺线 r = a + bθ"""

    def construct(self):
        theme = apply_scene_theme(self)
        p = get_params({"title": "阿基米德螺线", "a": 0.15, "b": 0.12, "subtitle": "r = a + bθ"})
        a = float(p.get("a", 0.15))
        b = float(p.get("b", 0.12))
        curve = build_polar_curve(
            lambda t: a + b * t, 0, 6 * PI, color=theme.secondary
        )
        _play_curve_scene(
            self, str(p.get("title", "阿基米德螺线")), curve, str(p.get("subtitle", "")), theme
        )


class ManimExponentialSpiral(Scene):
    """指数螺线 r = a·e^(bθ)"""

    def construct(self):
        theme = apply_scene_theme(self)
        p = get_params({"title": "指数螺线", "a": 0.08, "b": 0.18, "subtitle": "r = a·e^(bθ)"})
        a = float(p.get("a", 0.08))
        b = float(p.get("b", 0.18))
        curve = build_polar_curve(
            lambda t: a * math.exp(b * t), 0, 3.2 * PI, color=theme.accent
        )
        _play_curve_scene(
            self, str(p.get("title", "指数螺线")), curve, str(p.get("subtitle", "")), theme
        )


class ManimLemniscate(Scene):
    """莱姆尼斯盖特（∞ 形）"""

    def construct(self):
        theme = apply_scene_theme(self)
        p = get_params({"title": "莱姆尼斯盖特", "a": 2.0, "subtitle": "(x²+y²)² = a²(x²-y²)"})
        a = float(p.get("a", 2.0))

        def x_fn(t):
            return a * math.cos(t) / (1 + math.sin(t) ** 2)

        def y_fn(t):
            return a * math.sin(t) * math.cos(t) / (1 + math.sin(t) ** 2)

        curve = build_parametric(x_fn, y_fn, 0, TAU, color=theme.primary)
        _play_curve_scene(
            self, str(p.get("title", "莱姆尼斯盖特")), curve, str(p.get("subtitle", "")), theme
        )


class ManimCycloid(Scene):
    """摆线"""

    def construct(self):
        theme = apply_scene_theme(self)
        p = get_params({"title": "摆线", "a": 0.55, "subtitle": "轮子滚动轨迹"})
        a = float(p.get("a", 0.55))
        curve = build_parametric(
            lambda t: a * (t - math.sin(t)),
            lambda t: a * (1 - math.cos(t)),
            0,
            4 * PI,
            color=theme.secondary,
        )
        _play_curve_scene(self, str(p.get("title", "摆线")), curve, str(p.get("subtitle", "")), theme)


class ManimLissajous(Scene):
    """李萨如图形"""

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
        _play_curve_scene(
            self, str(p.get("title", "李萨如图形")), curve, str(p.get("subtitle", "")), theme
        )


class ManimLorenzAttractor(ThreeDScene):
    """洛伦兹吸引子三维轨迹"""

    def construct(self):
        theme = apply_scene_theme(self)
        p = get_params({"title": "洛伦兹吸引子", "subtitle": "混沌中的蝴蝶"})
        title = mk_title(str(p.get("title", "洛伦兹吸引子")))
        self.add_fixed_in_frame_mobjects(title)

        paths = build_lorenz_group(p, theme)
        axes = ThreeDAxes(
            x_range=[-4, 4, 2],
            y_range=[-4, 4, 2],
            z_range=[-2, 4, 2],
            x_length=6,
            y_length=6,
            z_length=4,
        )
        self.set_camera_orientation(phi=70 * DEGREES, theta=35 * DEGREES)
        self.play(Write(title), Create(axes), run_time=1)
        self.play(Create(paths), run_time=3)
        sub = str(p.get("subtitle", ""))
        if sub:
            lbl = mk_text(sub, font_size=20, color=theme.muted)
            lbl.to_corner(DR)
            self.add_fixed_in_frame_mobjects(lbl)
            self.play(FadeIn(lbl))
        self.begin_ambient_camera_rotation(rate=0.15)
        self.wait(2)
        self.stop_ambient_camera_rotation()
        self.wait(0.5)


class ManimMandelbrotZoom(Scene):
    """曼德布罗集分形（静态图 + 放大动画）"""

    def construct(self):
        theme = apply_scene_theme(self)
        p = get_params({"title": "曼德布罗集", "subtitle": "z_{n+1} = z_n² + c"})
        title = mk_title(str(p.get("title", "曼德布罗集")))

        arr = mandelbrot_rgba()
        img = ImageMobject(arr)
        img.set_width(9)
        img.move_to(ORIGIN + DOWN * 0.2)

        zoom = mandelbrot_rgba(
            xmin=-0.75,
            xmax=-0.73,
            ymin=0.08,
            ymax=0.10,
            max_iter=96,
        )
        zoom_img = ImageMobject(zoom)
        zoom_img.set_width(9)
        zoom_img.move_to(ORIGIN + DOWN * 0.2)
        zoom_img.set_opacity(0)

        sub = mk_text(str(p.get("subtitle", "")), font_size=20, color=theme.muted)
        sub.to_edge(DOWN, buff=0.4)

        self.play(Write(title), FadeIn(img), run_time=1.2)
        if str(p.get("subtitle", "")):
            self.play(FadeIn(sub))
        self.wait(0.6)
        self.play(img.animate.scale(2.2), run_time=1.8)
        self.play(
            img.animate.set_opacity(0.15),
            zoom_img.animate.set_opacity(1),
            run_time=2,
        )
        self.wait(1)
