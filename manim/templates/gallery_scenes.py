"""Manim 官方 Example Gallery 精选 — 可配置 params 与官方示例对齐"""
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

from templates._axes import make_axes, make_number_plane
from templates._curves import build_parametric
from templates._formula_eval import eval_curve_expr
from templates._layout import drop_content, mk_title
from templates._params import get_params
from templates._tex import latex_available, mk_mathtex, mk_mathtex_parts, mk_text
from templates._theme import apply_scene_theme


def _f(p, key, default):
    v = p.get(key)
    return float(default if v is None else v)


def _i(p, key, default):
    v = p.get(key)
    return int(default if v is None else v)


def _rt(p, key, default):
    times = p.get("run_times")
    if isinstance(times, dict) and key in times:
        return float(times[key])
    alt = p.get(f"{key}_run_time")
    if alt is not None:
        return float(alt)
    return float(default)


def _title_fs(p, default=32):
    return _i(p, "title_font_size", default)


def _label_fs(p, default=22):
    if p.get("label_font_size") is not None:
        return _i(p, "label_font_size", default)
    return _i(p, "font_size", default)


def _formula_fs(p, default=42):
    if p.get("formula_font_size") is not None:
        return _i(p, "formula_font_size", default)
    return _i(p, "font_size", default)


def _play_title(self, p, default_rt=0.5):
    if not p.get("title"):
        return None
    title = mk_title(str(p["title"]), font_size=_title_fs(p))
    self.play(FadeIn(title), run_time=_rt(p, "title", default_rt))
    return title


def _parse_point(raw, default):
    if raw is None:
        return np.array(default, dtype=float)
    if isinstance(raw, (list, tuple)) and len(raw) >= 2:
        z = float(raw[2]) if len(raw) > 2 else 0.0
        return np.array([float(raw[0]), float(raw[1]), z], dtype=float)
    return np.array(default, dtype=float)


def _parse_range(raw, default):
    if isinstance(raw, (list, tuple)) and len(raw) >= 2:
        step = float(raw[2]) if len(raw) > 2 else 1.0
        return [float(raw[0]), float(raw[1]), step]
    return list(default)


def _make_xy_fn(expr):
    """y=f(x) 表达式；JSON 中可用 x 或 t 作为自变量。"""
    s = str(expr or "0").strip()
    if "t" not in s and "x" in s:
        s = s.replace("x", "t")

    def fn(x):
        return eval_curve_expr(s, x)

    return fn


def _rotate_about_point(p, key="rotate_about", default="RIGHT"):
    about_key = str(p.get(key, default)).upper()
    if about_key == "LEFT":
        return LEFT
    if about_key == "UP":
        return UP
    if about_key == "DOWN":
        return DOWN
    if about_key == "ORIGIN":
        return ORIGIN
    if isinstance(p.get(key), (list, tuple)):
        return _parse_point(p.get(key), [2, 0, 0])
    return RIGHT


class ManimMovingFrameBox(Scene):
    """MovingFrameBox — 分段 MathTex + SurroundingRectangle 框选切换"""

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
                "frame_buff": 0.12,
                "title_font_size": 32,
                "formula_font_size": 42,
                "hint_font_size": 18,
                "hold_seconds": 0.8,
                "run_times": {"title": 0.5, "write": 1.2, "box_create": 0.8, "box_switch": 0.5, "between": 0.4},
            }
        )
        parts = p.get("parts") or []
        highlights = p.get("highlight_indices") or [1, 3]
        frame_color = p.get("frame_color") or theme.accent
        buff = _f(p, "frame_buff", 0.12)
        hold = _f(p, "hold_seconds", 0.8)

        _play_title(self, p)
        formula = mk_mathtex_parts(parts, font_size=_formula_fs(p), color=theme.text)
        drop_content(formula)
        self.play(Write(formula), run_time=_rt(p, "write", 1.2))

        if not latex_available():
            hint = mk_text(
                "安装 texlive 可显示完整 LaTeX 公式",
                font_size=_i(p, "hint_font_size", 18),
                color=theme.muted,
            ).to_edge(DOWN)
            self.play(FadeIn(hint), run_time=_rt(p, "hint", 0.4))

        valid = [int(i) for i in highlights if 0 <= int(i) < len(formula)]
        if len(valid) < 1:
            self.wait(hold)
            return

        box = SurroundingRectangle(formula[valid[0]], buff=buff, color=frame_color)
        self.play(Create(box), run_time=_rt(p, "box_create", 0.8))
        self.wait(_rt(p, "between", 0.4))
        for idx in valid[1:]:
            next_box = SurroundingRectangle(formula[idx], buff=buff, color=frame_color)
            self.play(ReplacementTransform(box, next_box), run_time=_rt(p, "box_switch", 0.5))
            box = next_box
            self.wait(_rt(p, "between", 0.4))
        self.wait(hold)


class ManimPointWithTrace(Scene):
    """PointWithTrace — 动点留轨迹"""

    def construct(self):
        theme = apply_scene_theme(self)
        p = get_params(
            {
                "title": "",
                "mode": "demo",
                "trace_color": None,
                "dot_color": None,
                "trace_stroke_width": 3,
                "rotate_angle": 3.141592653589793,
                "rotate_about": "RIGHT",
                "moves": [[0, 1, 0], [-1, 0, 0]],
                "move_run_times": None,
                "x": "cos(t)",
                "y": "sin(t)",
                "t_min": 0,
                "t_max": 6.283185307179586,
                "guide_opacity": 0.35,
                "guide_samples": 400,
                "hold_seconds": 0.8,
                "title_font_size": 32,
                "run_times": {"title": 0.5, "rotate": 2, "move": 1, "guide": 1, "trace": 4, "pause": 0.3},
            }
        )
        mode = str(p.get("mode", "demo"))
        trace_color = p.get("trace_color") or theme.accent
        dot_color = p.get("dot_color") or theme.primary
        stroke_w = _f(p, "trace_stroke_width", 3)
        hold = _f(p, "hold_seconds", 0.8)

        _play_title(self, p)
        if mode == "parametric":
            self._play_parametric_trace(p, theme, trace_color, dot_color, stroke_w, hold)
        else:
            self._play_demo_trace(p, theme, trace_color, dot_color, stroke_w, hold)

    def _trace_setup(self, dot, trace_color, stroke_width):
        path = VMobject(stroke_color=trace_color, stroke_width=stroke_width)

        def update_path(mob):
            prev = mob.copy()
            prev.add_points_as_corners([dot.get_center()])
            mob.become(prev)

        path.set_points_as_corners([dot.get_center(), dot.get_center()])
        path.add_updater(update_path)
        return path

    def _play_demo_trace(self, p, theme, trace_color, dot_color, stroke_w, hold):
        dot = Dot(color=dot_color)
        path = self._trace_setup(dot, trace_color, stroke_w)
        self.add(path, dot)

        angle = float(p.get("rotate_angle", PI))
        about = _rotate_about_point(p, "rotate_about", "RIGHT")
        self.play(
            Rotating(dot, angle=angle, about_point=about),
            run_time=_rt(p, "rotate", 2),
        )
        self.wait(_rt(p, "pause", 0.3))

        moves = p.get("moves") or [[0, 1, 0], [-1, 0, 0]]
        move_rts = p.get("move_run_times")
        for i, move in enumerate(moves):
            vec = np.array([float(move[0]), float(move[1]), float(move[2] if len(move) > 2 else 0)])
            rt = float(move_rts[i]) if isinstance(move_rts, list) and i < len(move_rts) else _rt(p, "move", 1)
            self.play(dot.animate.shift(vec), run_time=rt)
        path.clear_updaters()
        self.wait(hold)

    def _play_parametric_trace(self, p, theme, trace_color, dot_color, stroke_w, hold):
        x_expr = str(p.get("x", "cos(t)"))
        y_expr = str(p.get("y", "sin(t)"))
        t_min = float(p.get("t_min", 0))
        t_max = float(p.get("t_max", TAU))
        run_time = _rt(p, "trace", float(p.get("run_time", 4)))
        n = _i(p, "guide_samples", 400)
        opacity = _f(p, "guide_opacity", 0.35)

        def point_at(t):
            return np.array([eval_curve_expr(x_expr, t), eval_curve_expr(y_expr, t), 0])

        guide = build_parametric(
            lambda t: eval_curve_expr(x_expr, t),
            lambda t: eval_curve_expr(y_expr, t),
            t_min,
            t_max,
            color=theme.muted,
            n=n,
        )
        guide.set_stroke(opacity=opacity)
        dot = Dot(color=dot_color).move_to(point_at(t_min))
        path = self._trace_setup(dot, trace_color, stroke_w)
        drop_content(VGroup(guide, dot))
        self.play(Create(guide), run_time=_rt(p, "guide", 1))
        self.add(path, dot)

        tracker = ValueTracker(t_min)
        dot.add_updater(lambda m: m.move_to(point_at(tracker.get_value())))
        self.play(tracker.animate.set_value(t_max), run_time=run_time, rate_func=linear)
        dot.clear_updaters()
        path.clear_updaters()
        self.wait(hold)


class ManimVectorArrow(Scene):
    """VectorArrow — NumberPlane + Arrow + 坐标标注"""

    def construct(self):
        theme = apply_scene_theme(self)
        p = get_params(
            {
                "title": "",
                "arrow_start": [0, 0, 0],
                "arrow_end": [2, 2, 0],
                "origin_text": "(0, 0)",
                "tip_text": "(2, 2)",
                "origin_label_dir": "DOWN",
                "tip_label_dir": "RIGHT",
                "show_plane": True,
                "plane_x_range": [-7, 7, 1],
                "plane_y_range": [-4, 4, 1],
                "label_font_size": 24,
                "hold_seconds": 0.8,
                "title_font_size": 32,
                "run_times": {"title": 0.5, "diagram": 1.2},
            }
        )
        start = _parse_point(p.get("arrow_start"), [0, 0, 0])
        end = _parse_point(p.get("arrow_end"), [2, 2, 0])
        hold = _f(p, "hold_seconds", 0.8)
        lbl_fs = _label_fs(p, 24)

        _play_title(self, p)
        content = VGroup()
        if p.get("show_plane", True):
            plane = make_number_plane(
                x_range=_parse_range(p.get("plane_x_range"), [-7, 7, 1]),
                y_range=_parse_range(p.get("plane_y_range"), [-4, 4, 1]),
            )
            content.add(plane)
        dot = Dot(start, color=theme.primary)
        arrow = Arrow(start, end, buff=0, color=theme.accent)
        origin_dir = globals().get(str(p.get("origin_label_dir", "DOWN")).upper(), DOWN)
        tip_dir = globals().get(str(p.get("tip_label_dir", "RIGHT")).upper(), RIGHT)
        origin_text = mk_text(str(p.get("origin_text", "(0, 0)")), font_size=lbl_fs).next_to(dot, origin_dir)
        tip_text = mk_text(str(p.get("tip_text", "(2, 2)")), font_size=lbl_fs).next_to(arrow.get_end(), tip_dir)
        diagram = VGroup(dot, arrow, origin_text, tip_text)
        content.add(diagram)
        drop_content(content)
        self.play(
            FadeIn(dot),
            GrowArrow(arrow),
            FadeIn(origin_text),
            FadeIn(tip_text),
            run_time=_rt(p, "diagram", 1.2),
        )
        self.wait(hold)


class ManimBraceAnnotation(Scene):
    """BraceAnnotation — 线段 + Brace 标注"""

    def construct(self):
        theme = apply_scene_theme(self)
        p = get_params(
            {
                "title": "",
                "dot1": [-2, -1, 0],
                "dot2": [2, 1, 0],
                "horizontal_label": "Horizontal distance",
                "formula_label": "x-x_1",
                "show_formula_brace": True,
                "line_color": None,
                "line_stroke_width": 4,
                "label_font_size": 22,
                "hold_seconds": 0.8,
                "title_font_size": 32,
                "run_times": {"title": 0.5, "diagram": 1.5},
            }
        )
        d1 = _parse_point(p.get("dot1"), [-2, -1, 0])
        d2 = _parse_point(p.get("dot2"), [2, 1, 0])
        line_color = p.get("line_color") or theme.accent
        hold = _f(p, "hold_seconds", 0.8)
        lbl_fs = _label_fs(p, 22)

        _play_title(self, p)
        dot1 = Dot(d1)
        dot2 = Dot(d2)
        line = Line(d1, d2).set_color(line_color).set_stroke(width=_f(p, "line_stroke_width", 4))
        b1 = Brace(line)
        b1text = b1.get_text(str(p.get("horizontal_label", "Horizontal distance")))
        group = VGroup(line, dot1, dot2, b1, b1text)
        if p.get("show_formula_brace", True):
            b2 = Brace(line, direction=line.copy().rotate(PI / 2).get_unit_vector())
            formula = str(p.get("formula_label", "x-x_1"))
            if latex_available():
                try:
                    b2text = b2.get_tex(formula)
                except Exception:
                    b2text = mk_text(formula, font_size=lbl_fs)
            else:
                b2text = mk_text(formula.replace("_", " "), font_size=lbl_fs)
            group.add(b2, b2text)

        drop_content(group)
        self.play(FadeIn(group), run_time=_rt(p, "diagram", 1.5))
        self.wait(hold)


class ManimSinCosPlot(Scene):
    """SinAndCosFunctionPlot — 可配置 sin/cos 表达式"""

    def construct(self):
        theme = apply_scene_theme(self)
        p = get_params(
            {
                "title": "sin(x) 与 cos(x)",
                "sin_expr": "sin(x)",
                "cos_expr": "cos(x)",
                "sin_label": "sin(x)",
                "cos_label": "cos(x)",
                "x_range": [-10, 10.3, 1],
                "y_range": [-1.5, 1.5, 1],
                "x_length": 10,
                "y_length": 5,
                "plot_x_min": None,
                "plot_x_max": None,
                "show_vertical_line": True,
                "vertical_at": 6.283185307179586,
                "vertical_label": "x=2π",
                "label_font_size": 22,
                "hold_seconds": 1.0,
                "title_font_size": 32,
                "run_times": {"title": 0.5, "axes": 1.0, "curves": 1.2, "vertical": 0.6},
            }
        )
        x_rng = _parse_range(p.get("x_range"), [-10, 10.3, 1])
        y_rng = _parse_range(p.get("y_range"), [-1.5, 1.5, 1])
        plot_x0 = float(p.get("plot_x_min") if p.get("plot_x_min") is not None else x_rng[0])
        plot_x1 = float(p.get("plot_x_max") if p.get("plot_x_max") is not None else x_rng[1])
        hold = _f(p, "hold_seconds", 1.0)
        lbl_fs = _label_fs(p, 22)
        sin_fn = _make_xy_fn(p.get("sin_expr", "sin(x)"))
        cos_fn = _make_xy_fn(p.get("cos_expr", "cos(x)"))

        _play_title(self, p)
        axes = make_axes(
            x_range=x_rng,
            y_range=y_rng,
            x_length=_f(p, "x_length", 10),
            y_length=_f(p, "y_length", 5),
            axis_config={"color": theme.muted},
        )
        sin_graph = axes.plot(sin_fn, color=theme.secondary, x_range=[plot_x0, plot_x1])
        cos_graph = axes.plot(cos_fn, color=theme.primary, x_range=[plot_x0, plot_x1])
        sin_label = mk_text(str(p.get("sin_label", "sin(x)")), font_size=lbl_fs, color=theme.secondary).next_to(
            sin_graph, UP, buff=0.15
        )
        cos_label = mk_text(str(p.get("cos_label", "cos(x)")), font_size=lbl_fs, color=theme.primary).next_to(
            cos_graph, UR, buff=0.15
        )
        plot = VGroup(axes, sin_graph, cos_graph, sin_label, cos_label)
        extras = VGroup()
        if p.get("show_vertical_line", True):
            try:
                v_at = float(p.get("vertical_at", TAU))
                vert = axes.get_vertical_line(axes.i2gp(v_at, cos_graph), color=theme.accent, line_func=Line)
                extras.add(vert)
                extras.add(
                    mk_text(str(p.get("vertical_label", "x=2π")), font_size=lbl_fs, color=theme.text).next_to(
                        vert, UR, buff=0.1
                    )
                )
            except Exception:
                pass

        drop_content(VGroup(plot, extras))
        self.play(Create(axes), run_time=_rt(p, "axes", 1.0))
        self.play(
            Create(sin_graph),
            Create(cos_graph),
            FadeIn(sin_label),
            FadeIn(cos_label),
            run_time=_rt(p, "curves", 1.2),
        )
        if len(extras) > 0:
            self.play(FadeIn(extras), run_time=_rt(p, "vertical", 0.6))
        self.wait(hold)


class ManimPointOnPath(Scene):
    """PointMovingOnShapes — 沿圆/线运动 + 旋转"""

    def construct(self):
        theme = apply_scene_theme(self)
        p = get_params(
            {
                "title": "",
                "circle_center": [0, 0, 0],
                "circle_radius": 1,
                "circle_color": None,
                "line_start": [3, 0, 0],
                "line_end": [5, 0, 0],
                "transform_shift": [1, 0, 0],
                "rotate_about": [2, 0, 0],
                "hold_seconds": 0.5,
                "title_font_size": 32,
                "run_times": {"title": 0.5, "grow": 1.0, "transform": 0.8, "path": 2, "rotate": 1.5},
            }
        )
        center = _parse_point(p.get("circle_center"), [0, 0, 0])
        radius = _f(p, "circle_radius", 1)
        hold = _f(p, "hold_seconds", 0.5)
        circle_color = p.get("circle_color") or theme.secondary

        _play_title(self, p)
        circle = Circle(radius=radius, color=circle_color).move_to(center)
        dot = Dot(color=theme.primary).move_to(center)
        shift = _parse_point(p.get("transform_shift"), [1, 0, 0])
        dot2 = dot.copy().shift(shift)
        line = Line(
            _parse_point(p.get("line_start"), [3, 0, 0]),
            _parse_point(p.get("line_end"), [5, 0, 0]),
            color=theme.muted,
        )
        content = VGroup(circle, line, dot)
        drop_content(content)
        self.add(dot)
        self.add(line)
        self.play(GrowFromCenter(circle), run_time=_rt(p, "grow", 1.0))
        self.play(Transform(dot, dot2), run_time=_rt(p, "transform", 0.8))
        self.play(MoveAlongPath(dot, circle), run_time=_rt(p, "path", 2), rate_func=linear)
        self.play(
            Rotating(dot, about_point=_parse_point(p.get("rotate_about"), [2, 0, 0])),
            run_time=_rt(p, "rotate", 1.5),
        )
        self.wait(hold)


class ManimMovingAngle(Scene):
    """MovingAngle — ValueTracker 驱动角度变化"""

    def construct(self):
        theme = apply_scene_theme(self)
        p = get_params(
            {
                "title": "",
                "theta_start": 110,
                "theta_mid": 40,
                "theta_increment": 140,
                "theta_end": 350,
                "rotation_center": "LEFT",
                "line_half_length": 3,
                "angle_radius": 0.5,
                "theta_label": r"\theta",
                "formula_font_size": 32,
                "hold_seconds": 0.5,
                "title_font_size": 32,
                "run_times": {
                    "title": 0.5,
                    "to_mid": 1.2,
                    "increment": 1.2,
                    "color_flash": 0.5,
                    "to_end": 1.5,
                    "intro_wait": 0.3,
                },
            }
        )
        hold = _f(p, "hold_seconds", 0.5)
        center = _rotate_about_point(p, "rotation_center", "LEFT")
        half = _f(p, "line_half_length", 3)
        ang_r = _f(p, "angle_radius", 0.5)

        _play_title(self, p)
        theta_tracker = ValueTracker(_f(p, "theta_start", 110))
        line1 = Line(center + LEFT * half, center + RIGHT * half, color=theme.muted)
        line_moving = Line(center + LEFT * half, center + RIGHT * half, color=theme.accent)
        line_ref = line_moving.copy()

        def angle_mob():
            lm = line_ref.copy().rotate(theta_tracker.get_value() * DEGREES, about_point=center)
            return Angle(line1, lm, radius=ang_r, other_angle=False)

        def tex_mob():
            ang = angle_mob()
            return mk_mathtex(str(p.get("theta_label", r"\theta")), font_size=_formula_fs(p, 32), color=theme.text).move_to(
                ang.point_from_proportion(0.5)
            )

        line_moving.rotate(theta_tracker.get_value() * DEGREES, about_point=center)
        angle = angle_mob()
        tex = tex_mob()

        line_moving.add_updater(
            lambda x: x.become(line_ref.copy()).rotate(
                theta_tracker.get_value() * DEGREES, about_point=center
            )
        )
        angle.add_updater(lambda x: x.become(angle_mob()))
        tex.add_updater(lambda x: x.become(tex_mob()))

        group = VGroup(line1, line_moving, angle, tex)
        drop_content(group)
        self.add(line1, line_moving, angle, tex)
        self.wait(_rt(p, "intro_wait", 0.3))
        self.play(theta_tracker.animate.set_value(_f(p, "theta_mid", 40)), run_time=_rt(p, "to_mid", 1.2))
        self.play(
            theta_tracker.animate.increment_value(_f(p, "theta_increment", 140)),
            run_time=_rt(p, "increment", 1.2),
        )
        self.play(tex.animate.set_color(theme.primary), run_time=_rt(p, "color_flash", 0.5))
        self.play(theta_tracker.animate.set_value(_f(p, "theta_end", 350)), run_time=_rt(p, "to_end", 1.5))
        self.wait(hold)


class ManimSineUnitCircle(Scene):
    """SineCurveUnitCircle — 单位圆推导正弦曲线"""

    def construct(self):
        theme = apply_scene_theme(self)
        p = get_params(
            {
                "title": "单位圆与正弦曲线",
                "origin_x": -4,
                "circle_radius": 1,
                "x_axis_start": -6,
                "x_axis_end": 6,
                "y_axis_half": 2,
                "curve_x_scale": 4,
                "orbit_rate": 0.25,
                "run_seconds": 8,
                "hold_seconds": 0.5,
                "title_font_size": 32,
                "run_times": {"title": 0.5},
            }
        )
        origin_x = _f(p, "origin_x", -4)
        radius = _f(p, "circle_radius", 1)
        run_seconds = _f(p, "run_seconds", 8)
        hold = _f(p, "hold_seconds", 0.5)
        x_scale = _f(p, "curve_x_scale", 4)
        base_rate = _f(p, "orbit_rate", 0.25)
        rate = base_rate / max(run_seconds / 8.5, 0.1)

        _play_title(self, p)
        origin = np.array([origin_x, 0, 0])
        curve_start = np.array([origin_x + 1, 0, 0])
        x_axis = Line(
            np.array([_f(p, "x_axis_start", -6), 0, 0]),
            np.array([_f(p, "x_axis_end", 6), 0, 0]),
            color=theme.muted,
        )
        y_half = _f(p, "y_axis_half", 2)
        y_axis = Line(
            np.array([origin_x, -y_half, 0]),
            np.array([origin_x, y_half, 0]),
            color=theme.muted,
        )
        circle = Circle(radius=radius, color=theme.secondary).move_to(origin)
        dot = Dot(radius=0.08, color=theme.accent).move_to(circle.point_from_proportion(0))

        self.t_offset = 0.0

        def go_around(mob, dt):
            self.t_offset += dt * rate
            mob.move_to(circle.point_from_proportion(self.t_offset % 1))

        def line_to_axis():
            return Line(origin, dot.get_center(), color=theme.secondary)

        def line_to_curve():
            x = curve_start[0] + self.t_offset * x_scale
            y = dot.get_center()[1]
            return Line(dot.get_center(), np.array([x, y, 0]), color=theme.accent, stroke_width=2)

        curve = VGroup(Line(curve_start, curve_start))

        def extend_curve():
            last = curve[-1]
            x = curve_start[0] + self.t_offset * x_scale
            y = dot.get_center()[1]
            curve.add(Line(last.get_end(), np.array([x, y, 0]), color=theme.primary, stroke_width=2))
            return curve

        dot.add_updater(go_around)
        axis_line = always_redraw(line_to_axis)
        proj_line = always_redraw(line_to_curve)
        sine_curve = always_redraw(extend_curve)

        content = VGroup(x_axis, y_axis, circle, axis_line, proj_line, sine_curve, dot)
        drop_content(content)
        self.add(x_axis, y_axis, circle, axis_line, proj_line, sine_curve, dot)
        self.wait(run_seconds)
        dot.remove_updater(go_around)
        self.wait(hold)


class ManimBooleanOps(Scene):
    """BooleanOperations — 椭圆布尔运算演示"""

    def construct(self):
        theme = apply_scene_theme(self)
        p = get_params(
            {
                "title": "",
                "header_label": "Boolean Operation",
                "operations": ["intersection", "union", "exclusion", "difference"],
                "ellipse_width": 4.0,
                "ellipse_height": 5.0,
                "ellipse1_shift": [-2.5, 0, 0],
                "ellipse2_shift": [0.5, 0, 0],
                "stroke_width": 8,
                "fill_opacity": 0.5,
                "result_scale": 0.35,
                "result_position": [4, 1.5, 0],
                "header_font_size": 28,
                "label_font_size": 22,
                "hold_seconds": 0.4,
                "title_font_size": 32,
                "run_times": {"title": 0.5, "base": 1.0, "op": 0.8, "label": 0.5},
            }
        )
        ops = [str(o).lower() for o in (p.get("operations") or ["intersection", "union", "exclusion", "difference"])]
        hold = _f(p, "hold_seconds", 0.4)
        res_pos = _parse_point(p.get("result_position"), [4, 1.5, 0])
        res_scale = _f(p, "result_scale", 0.35)

        _play_title(self, p)
        ellipse1 = Ellipse(
            width=_f(p, "ellipse_width", 4.0),
            height=_f(p, "ellipse_height", 5.0),
            fill_opacity=_f(p, "fill_opacity", 0.5),
            color=theme.secondary,
            stroke_width=_f(p, "stroke_width", 8),
        ).move_to(_parse_point(p.get("ellipse1_shift"), [-2.5, 0, 0]))
        ellipse2 = ellipse1.copy().set_color(theme.primary).move_to(_parse_point(p.get("ellipse2_shift"), [0.5, 0, 0]))
        header = mk_text(
            str(p.get("header_label", "Boolean Operation")),
            font_size=_i(p, "header_font_size", 28),
            color=theme.text,
        )
        header.to_edge(UP)
        base = VGroup(header, ellipse1, ellipse2)
        drop_content(base)
        self.play(FadeIn(header), FadeIn(ellipse1), FadeIn(ellipse2), run_time=_rt(p, "base", 1.0))

        op_defs = {
            "intersection": (Intersection, "Intersection", GREEN),
            "union": (Union, "Union", ORANGE),
            "exclusion": (Exclusion, "Exclusion", YELLOW),
            "difference": (Difference, "Difference", PINK),
        }
        last = None
        last_txt = None
        for key in ops:
            if key not in op_defs:
                continue
            cls, label, color = op_defs[key]
            shape = cls(ellipse1, ellipse2, color=color, fill_opacity=_f(p, "fill_opacity", 0.5))
            target = shape.copy().scale(res_scale).move_to(res_pos)
            if last is None:
                self.play(FadeIn(target), run_time=_rt(p, "op", 0.8))
            else:
                self.play(ReplacementTransform(last, target), run_time=_rt(p, "op", 0.8))
            last = target
            txt = mk_text(label, font_size=_label_fs(p, 22)).next_to(target, UP)
            if last_txt is None:
                self.play(FadeIn(txt), run_time=_rt(p, "label", 0.5))
            else:
                self.play(ReplacementTransform(last_txt, txt), run_time=_rt(p, "label", 0.5))
            last_txt = txt
            self.wait(hold)
        self.wait(0.5)


try:
    from manim import MovingCameraScene as _MovingCameraBase
except ImportError:
    _MovingCameraBase = Scene


class ManimFollowingCamera(_MovingCameraBase):
    """FollowingGraphCamera — 相机跟随曲线上的动点"""

    def construct(self):
        theme = apply_scene_theme(self)
        p = get_params(
            {
                "title": "",
                "curve_expr": "sin(x)",
                "x_range": [-1, 10, 1],
                "y_range": [-1.5, 1.5, 1],
                "curve_x_min": 0,
                "curve_x_max": None,
                "camera_scale": 0.55,
                "restore_camera": True,
                "follow_run_time": 4,
                "hold_seconds": 0.5,
                "title_font_size": 32,
                "run_times": {"title": 0.5, "zoom": 1.0, "follow": 4, "restore": 1.0},
            }
        )
        follow_rt = _rt(p, "follow", float(p.get("follow_run_time", 4)))
        hold = _f(p, "hold_seconds", 0.5)
        use_camera = hasattr(self, "camera") and hasattr(self.camera, "frame")
        curve_fn = _make_xy_fn(p.get("curve_expr", "sin(x)"))
        x_rng = _parse_range(p.get("x_range"), [-1, 10, 1])
        y_rng = _parse_range(p.get("y_range"), [-1.5, 1.5, 1])
        cx0 = _f(p, "curve_x_min", 0)
        cx1 = float(p.get("curve_x_max") if p.get("curve_x_max") is not None else 3 * PI)
        cam_scale = _f(p, "camera_scale", 0.55)

        if p.get("title"):
            title = mk_title(str(p["title"]), font_size=_title_fs(p))
            if use_camera:
                self.add(title)
            else:
                self.play(FadeIn(title), run_time=_rt(p, "title", 0.5))

        ax = make_axes(x_range=x_rng, y_range=y_rng)
        graph = ax.plot(curve_fn, color=theme.secondary, x_range=[cx0, cx1])
        moving_dot = Dot(ax.i2gp(graph.t_min, graph), color=theme.accent)
        dot_1 = Dot(ax.i2gp(graph.t_min, graph), color=theme.muted)
        dot_2 = Dot(ax.i2gp(graph.t_max, graph), color=theme.muted)
        world = VGroup(ax, graph, dot_1, dot_2, moving_dot)
        drop_content(world)
        self.add(ax, graph, dot_1, dot_2, moving_dot)

        if use_camera:
            self.camera.frame.save_state()
            self.play(self.camera.frame.animate.scale(cam_scale).move_to(moving_dot), run_time=_rt(p, "zoom", 1.0))

            def update_frame(_):
                self.camera.frame.move_to(moving_dot.get_center())

            self.camera.frame.add_updater(update_frame)
            self.play(MoveAlongPath(moving_dot, graph, rate_func=linear), run_time=follow_rt)
            self.camera.frame.remove_updater(update_frame)
            if p.get("restore_camera", True):
                self.play(Restore(self.camera.frame), run_time=_rt(p, "restore", 1.0))
        else:
            self.play(MoveAlongPath(moving_dot, graph, rate_func=linear), run_time=follow_rt)

        self.wait(hold)


class ManimGraphArea(Scene):
    """GraphAreaPlot — 黎曼和与两曲线间面积"""

    def construct(self):
        theme = apply_scene_theme(self)
        p = get_params(
            {
                "title": "曲线与面积",
                "curve_1_expr": "4*x - x**2",
                "curve_2_expr": "0.8*x**2 - 3*x + 4",
                "curve_x_range": [0, 4],
                "x_max": 5,
                "y_max": 6,
                "vertical_lines_at": [2, 3],
                "riemann_x_range": [0.3, 0.6],
                "riemann_dx": 0.03,
                "area_x_range": [2, 3],
                "riemann_opacity": 0.5,
                "area_opacity": 0.5,
                "hold_seconds": 1.0,
                "title_font_size": 32,
                "run_times": {"title": 0.5, "plot": 1.5},
            }
        )
        x_max = _f(p, "x_max", 5)
        y_max = _f(p, "y_max", 6)
        hold = _f(p, "hold_seconds", 1.0)
        cx_rng = _parse_range(p.get("curve_x_range"), [0, 4, 1])
        cx0, cx1 = cx_rng[0], cx_rng[1]
        riemann_rng = p.get("riemann_x_range") or [0.3, 0.6]
        area_rng = p.get("area_x_range") or [2, 3]
        fn1 = _make_xy_fn(p.get("curve_1_expr", "4*x - x**2"))
        fn2 = _make_xy_fn(p.get("curve_2_expr", "0.8*x**2 - 3*x + 4"))

        _play_title(self, p)
        ax = make_axes(x_range=[0, x_max], y_range=[0, y_max])
        curve_1 = ax.plot(fn1, x_range=[cx0, min(cx1, x_max)], color=theme.secondary)
        curve_2 = ax.plot(fn2, x_range=[cx0, min(cx1, x_max)], color=theme.primary)
        verts = p.get("vertical_lines_at") or [2, 3]
        vlines = VGroup()
        for xv in verts:
            try:
                vlines.add(ax.get_vertical_line(ax.input_to_graph_point(float(xv), curve_1), color=theme.accent))
            except Exception:
                pass
        riemann_area = ax.get_riemann_rectangles(
            curve_1,
            x_range=[float(riemann_rng[0]), float(riemann_rng[1])],
            dx=_f(p, "riemann_dx", 0.03),
            color=theme.secondary,
            fill_opacity=_f(p, "riemann_opacity", 0.5),
        )
        area = ax.get_area(
            curve_2,
            [float(area_rng[0]), float(area_rng[1])],
            bounded_graph=curve_1,
            color=theme.muted,
            opacity=_f(p, "area_opacity", 0.5),
        )
        plot = VGroup(ax, curve_1, curve_2, vlines, riemann_area, area)
        drop_content(plot)
        self.add(plot)
        self.wait(hold)


class ManimHeatDiagram(Scene):
    """HeatDiagramPlot — 折线热力学示意"""

    def construct(self):
        theme = apply_scene_theme(self)
        p = get_params(
            {
                "title": "热图示意",
                "x_vals": [0, 8, 38, 39],
                "y_vals": [20, 0, 0, -5],
                "x_range": [0, 40, 5],
                "y_range": [-8, 32, 5],
                "x_length": 9,
                "y_length": 6,
                "x_label": "ΔQ",
                "y_label": "T(°C)",
                "label_font_size": 22,
                "hold_seconds": 1.0,
                "title_font_size": 32,
                "run_times": {"title": 0.5, "axes": 1.0, "graph": 1.2},
            }
        )
        x_vals = [float(v) for v in (p.get("x_vals") or [0, 8, 38, 39])]
        y_vals = [float(v) for v in (p.get("y_vals") or [20, 0, 0, -5])]
        hold = _f(p, "hold_seconds", 1.0)
        lbl_fs = _label_fs(p, 22)

        _play_title(self, p)
        ax = make_axes(
            x_range=_parse_range(p.get("x_range"), [0, 40, 5]),
            y_range=_parse_range(p.get("y_range"), [-8, 32, 5]),
            x_length=_f(p, "x_length", 9),
            y_length=_f(p, "y_length", 6),
        )
        x_lbl = mk_text(str(p.get("x_label", "ΔQ")), font_size=lbl_fs).next_to(ax.x_axis, DOWN)
        y_lbl = mk_text(str(p.get("y_label", "T(°C)")), font_size=lbl_fs).next_to(ax.y_axis, LEFT)
        graph = ax.plot_line_graph(x_values=x_vals, y_values=y_vals, line_color=theme.accent)
        plot = VGroup(ax, x_lbl, y_lbl, graph)
        drop_content(plot)
        self.play(Create(ax), FadeIn(x_lbl), FadeIn(y_lbl), run_time=_rt(p, "axes", 1.0))
        self.play(Create(graph), run_time=_rt(p, "graph", 1.2))
        self.wait(hold)
