import importlib.util
import math
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

from templates._curves import fit_curve_group, julia_rgba, mandelbrot_rgba
from templates._layout import mk_title
from templates._params import get_params
from templates._text import mk_text
from templates._theme import apply_scene_theme


class MandelbrotScene(Scene):
    """曼德布罗集（图像渲染，ECS 友好）"""

    def construct(self):
        theme = apply_scene_theme(self)
        p = get_params({"title": "曼德布罗集", "subtitle": "z_{n+1} = z_n² + c"})
        title = mk_title(str(p.get("title", "曼德布罗集")))
        img = ImageMobject(mandelbrot_rgba())
        img.set_width(9)
        img.move_to(DOWN * 0.15)
        sub = mk_text(str(p.get("subtitle", "")), font_size=20, color=theme.muted)
        sub.to_edge(DOWN, buff=0.4)
        self.play(Write(title), FadeIn(img), run_time=2)
        if str(p.get("subtitle", "")):
            self.play(FadeIn(sub))
        self.wait(1)


class JuliaScene(Scene):
    """朱利亚集"""

    def construct(self):
        theme = apply_scene_theme(self)
        p = get_params(
            {
                "title": "朱利亚集",
                "subtitle": "c = -0.7 + 0.27i",
                "c_real": -0.7,
                "c_imag": 0.27015,
            }
        )
        title = mk_title(str(p.get("title", "朱利亚集")))
        arr = julia_rgba(float(p.get("c_real", -0.7)), float(p.get("c_imag", 0.27015)))
        img = ImageMobject(arr)
        img.set_width(9)
        img.move_to(DOWN * 0.15)
        self.play(Write(title), FadeIn(img), run_time=2)
        sub = str(p.get("subtitle", ""))
        if sub:
            cap = mk_text(sub, font_size=20, color=theme.muted)
            cap.to_edge(DOWN, buff=0.4)
            self.play(FadeIn(cap))
        self.wait(1)


def _koch_points(points, depth: int):
    if depth == 0:
        return points
    new_pts = []
    n = len(points)
    for i in range(n - 1):
        p1 = np.array(points[i][:3], dtype=float)
        p2 = np.array(points[i + 1][:3], dtype=float)
        a = p1 + (p2 - p1) / 3
        b = p1 + 2 * (p2 - p1) / 3
        v = b - a
        rot = np.array([[0, -1, 0], [1, 0, 0], [0, 0, 1]])
        peak = a + rot @ v
        new_pts.extend([p1, a, peak, b])
    new_pts.append(np.array(points[-1][:3], dtype=float))
    return _koch_points(new_pts, depth - 1)


class KochSnowflakeScene(Scene):
    """Koch 雪花分形"""

    def construct(self):
        theme = apply_scene_theme(self)
        p = get_params({"title": "Koch 雪花", "depth": 4, "subtitle": "分形边界"})
        depth = int(p.get("depth", 4))
        depth = max(1, min(depth, 5))
        side = 4
        h = side * math.sqrt(3) / 2
        tri = [
            np.array([-side / 2, -h / 3, 0]),
            np.array([side / 2, -h / 3, 0]),
            np.array([0, 2 * h / 3, 0]),
            np.array([-side / 2, -h / 3, 0]),
        ]
        pts = _koch_points(tri, depth)
        snow = VMobject()
        snow.set_points_as_corners(pts)
        snow.set_stroke(color=theme.primary, width=3)
        fit_curve_group(snow, max_size=6)
        title = mk_title(str(p.get("title", "Koch 雪花")))
        self.play(Write(title), Create(snow), run_time=3)
        self.wait(1)
