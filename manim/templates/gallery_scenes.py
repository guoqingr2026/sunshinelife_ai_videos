"""Manim 官方 Example Gallery 精选 — 公式框选 / 轨迹追踪"""
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

from templates._curves import build_parametric
from templates._formula_eval import eval_curve_expr
from templates._layout import drop_content, mk_title
from templates._params import get_params
from templates._tex import latex_available, mk_mathtex_parts, mk_text
from templates._theme import apply_scene_theme


class ManimMovingFrameBox(Scene):
    """MovingFrameBox — 分段 MathTex + SurroundingRectangle 框选切换（需 texlive 效果最佳）"""

    def construct(self):
        theme = apply_scene_theme(self)
        p = get_params(
            {
                "title": "",
                "parts": [
                    r"\frac{d}{dx}f(x)g(x)=",
                    r"f(x)\frac{d}{dx}g(x)",
                    "+",
                    r"g(x)\frac{d}{dx}f(x)",
                ],
                "highlight_indices": [1, 3],
                "frame_color": None,
            }
        )
        parts = p.get("parts") or []
        highlights = p.get("highlight_indices") or [1, 3]
        frame_color = p.get("frame_color") or theme.accent

        if p.get("title"):
            title = mk_title(str(p["title"]))
            self.play(FadeIn(title))

        formula = mk_mathtex_parts(parts, font_size=42, color=theme.text)
        drop_content(formula)
        self.play(Write(formula))

        if not latex_available():
            hint = mk_text(
                "安装 texlive 可显示完整 LaTeX 公式",
                font_size=18,
                color=theme.muted,
            ).to_edge(DOWN)
            self.play(FadeIn(hint))

        valid = [int(i) for i in highlights if 0 <= int(i) < len(formula)]
        if len(valid) < 1:
            self.wait(1)
            return

        box = SurroundingRectangle(formula[valid[0]], buff=0.12, color=frame_color)
        self.play(Create(box))
        self.wait(0.4)
        for idx in valid[1:]:
            next_box = SurroundingRectangle(formula[idx], buff=0.12, color=frame_color)
            self.play(ReplacementTransform(box, next_box))
            box = next_box
            self.wait(0.4)
        self.wait(0.8)


class ManimPointWithTrace(Scene):
    """PointWithTrace — 动点留轨迹；mode=parametric 时沿 x(t),y(t) 公式绘制"""

    def construct(self):
        theme = apply_scene_theme(self)
        p = get_params(
            {
                "title": "",
                "mode": "demo",
                "trace_color": None,
                "dot_color": None,
                "rotate_angle": 3.141592653589793,
                "rotate_about": "RIGHT",
                "moves": [[0, 1, 0], [-1, 0, 0]],
                "x": "cos(t)",
                "y": "sin(t)",
                "t_min": 0,
                "t_max": 6.283185307179586,
                "run_time": 4,
                "hold_seconds": 0.8,
            }
        )
        mode = str(p.get("mode", "demo"))
        trace_color = p.get("trace_color") or theme.accent
        dot_color = p.get("dot_color") or theme.primary
        hold = float(p.get("hold_seconds", 0.8))

        if p.get("title"):
            title = mk_title(str(p["title"]))
            self.play(FadeIn(title))

        if mode == "parametric":
            self._play_parametric_trace(p, theme, trace_color, dot_color, hold)
        else:
            self._play_demo_trace(p, theme, trace_color, dot_color, hold)

    def _trace_setup(self, dot, trace_color):
        path = VMobject(stroke_color=trace_color, stroke_width=3)

        def update_path(mob):
            prev = mob.copy()
            prev.add_points_as_corners([dot.get_center()])
            mob.become(prev)

        path.set_points_as_corners([dot.get_center(), dot.get_center()])
        path.add_updater(update_path)
        return path

    def _play_demo_trace(self, p, theme, trace_color, dot_color, hold):
        dot = Dot(color=dot_color)
        path = self._trace_setup(dot, trace_color)
        self.add(path, dot)

        angle = float(p.get("rotate_angle", PI))
        about_key = str(p.get("rotate_about", "RIGHT")).upper()
        about = RIGHT if about_key == "RIGHT" else LEFT if about_key == "LEFT" else UP
        self.play(Rotating(dot, angle=angle, about_point=about, run_time=2))
        self.wait(0.3)

        for move in p.get("moves") or [[0, 1, 0], [-1, 0, 0]]:
            vec = np.array([float(move[0]), float(move[1]), float(move[2] if len(move) > 2 else 0)])
            self.play(dot.animate.shift(vec), run_time=1)
        path.clear_updaters()
        self.wait(hold)

    def _play_parametric_trace(self, p, theme, trace_color, dot_color, hold):
        x_expr = str(p.get("x", "cos(t)"))
        y_expr = str(p.get("y", "sin(t)"))
        t_min = float(p.get("t_min", 0))
        t_max = float(p.get("t_max", TAU))
        run_time = float(p.get("run_time", 4))

        def point_at(t):
            return np.array(
                [
                    eval_curve_expr(x_expr, t),
                    eval_curve_expr(y_expr, t),
                    0,
                ]
            )

        guide = build_parametric(
            lambda t: eval_curve_expr(x_expr, t),
            lambda t: eval_curve_expr(y_expr, t),
            t_min,
            t_max,
            color=theme.muted,
            n=400,
        )
        guide.set_stroke(opacity=0.35)
        dot = Dot(color=dot_color).move_to(point_at(t_min))
        path = self._trace_setup(dot, trace_color)
        drop_content(VGroup(guide, dot))
        self.play(Create(guide))
        self.add(path, dot)

        tracker = ValueTracker(t_min)
        dot.add_updater(lambda m: m.move_to(point_at(tracker.get_value())))
        self.play(
            tracker.animate.set_value(t_max),
            run_time=run_time,
            rate_func=linear,
        )
        dot.clear_updaters()
        path.clear_updaters()
        self.wait(hold)
