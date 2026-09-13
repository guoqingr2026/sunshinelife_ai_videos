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

from templates._axes import make_axes, make_number_plane
from templates._curves import build_parametric
from templates._formula_eval import eval_curve_expr
from templates._layout import drop_content, mk_title
from templates._params import get_params
from templates._tex import latex_available, mk_mathtex, mk_mathtex_parts, mk_text
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


def _parse_point(raw, default):
    if raw is None:
        return np.array(default, dtype=float)
    if isinstance(raw, (list, tuple)) and len(raw) >= 2:
        z = float(raw[2]) if len(raw) > 2 else 0.0
        return np.array([float(raw[0]), float(raw[1]), z], dtype=float)
    return np.array(default, dtype=float)


class ManimVectorArrow(Scene):
    """VectorArrow — NumberPlane + Arrow + 坐标标注"""

    def construct(self):
        theme = apply_scene_theme(self)
        p = get_params(
            {
                "title": "",
                "arrow_end": [2, 2, 0],
                "origin_text": "(0, 0)",
                "tip_text": "(2, 2)",
                "show_plane": True,
                "hold_seconds": 0.8,
            }
        )
        end = _parse_point(p.get("arrow_end"), [2, 2, 0])
        hold = float(p.get("hold_seconds", 0.8))

        if p.get("title"):
            self.play(FadeIn(mk_title(str(p["title"]))))

        content = VGroup()
        if p.get("show_plane", True):
            plane = make_number_plane()
            content.add(plane)
        dot = Dot(ORIGIN, color=theme.primary)
        arrow = Arrow(ORIGIN, end, buff=0, color=theme.accent)
        origin_text = mk_text(str(p.get("origin_text", "(0, 0)")), font_size=24).next_to(dot, DOWN)
        tip_text = mk_text(str(p.get("tip_text", "(2, 2)")), font_size=24).next_to(arrow.get_end(), RIGHT)
        diagram = VGroup(dot, arrow, origin_text, tip_text)
        content.add(diagram)
        drop_content(content)
        self.play(FadeIn(dot), GrowArrow(arrow), FadeIn(origin_text), FadeIn(tip_text))
        self.wait(hold)


class ManimBraceAnnotation(Scene):
    """BraceAnnotation — 线段 + Brace 标注（公式可选 texlive）"""

    def construct(self):
        theme = apply_scene_theme(self)
        p = get_params(
            {
                "title": "",
                "dot1": [-2, -1, 0],
                "dot2": [2, 1, 0],
                "horizontal_label": "Horizontal distance",
                "formula_label": "x-x_1",
                "line_color": None,
                "hold_seconds": 0.8,
            }
        )
        d1 = _parse_point(p.get("dot1"), [-2, -1, 0])
        d2 = _parse_point(p.get("dot2"), [2, 1, 0])
        line_color = p.get("line_color") or theme.accent
        hold = float(p.get("hold_seconds", 0.8))

        if p.get("title"):
            self.play(FadeIn(mk_title(str(p["title"]))))

        dot1 = Dot(d1)
        dot2 = Dot(d2)
        line = Line(d1, d2).set_color(line_color)
        b1 = Brace(line)
        b1text = b1.get_text(str(p.get("horizontal_label", "Horizontal distance")))
        b2 = Brace(
            line,
            direction=line.copy().rotate(PI / 2).get_unit_vector(),
        )
        formula = str(p.get("formula_label", "x-x_1"))
        if latex_available():
            try:
                b2text = b2.get_tex(formula)
            except Exception:
                b2text = mk_text(formula, font_size=22)
        else:
            b2text = mk_text(formula.replace("_", " "), font_size=22)

        group = VGroup(line, dot1, dot2, b1, b2, b1text, b2text)
        drop_content(group)
        self.play(
            FadeIn(dot1),
            FadeIn(dot2),
            Create(line),
            FadeIn(b1),
            FadeIn(b2),
            FadeIn(b1text),
            FadeIn(b2text),
        )
        self.wait(hold)


class ManimSinCosPlot(Scene):
    """SinAndCosFunctionPlot — 双三角函数曲线"""

    def construct(self):
        theme = apply_scene_theme(self)
        p = get_params(
            {
                "title": "sin(x) 与 cos(x)",
                "x_min": -10,
                "x_max": 10.3,
                "y_min": -1.5,
                "y_max": 1.5,
                "show_vertical_at_tau": True,
                "hold_seconds": 1.0,
            }
        )
        x_min = float(p.get("x_min", -10))
        x_max = float(p.get("x_max", 10.3))
        y_min = float(p.get("y_min", -1.5))
        y_max = float(p.get("y_max", 1.5))
        hold = float(p.get("hold_seconds", 1.0))

        if p.get("title"):
            self.play(FadeIn(mk_title(str(p["title"]))))

        axes = make_axes(
            x_range=[x_min, x_max, 1],
            y_range=[y_min, y_max, 1],
            x_length=10,
            y_length=5,
            axis_config={"color": theme.muted},
        )
        sin_graph = axes.plot(lambda x: np.sin(x), color=theme.secondary, x_range=[x_min, x_max])
        cos_graph = axes.plot(lambda x: np.cos(x), color=theme.primary, x_range=[x_min, x_max])
        sin_label = mk_text("sin(x)", font_size=22, color=theme.secondary).next_to(sin_graph, UP, buff=0.15)
        cos_label = mk_text("cos(x)", font_size=22, color=theme.primary).next_to(cos_graph, UR, buff=0.15)

        plot = VGroup(axes, sin_graph, cos_graph, sin_label, cos_label)
        extras = VGroup()
        if p.get("show_vertical_at_tau", True):
            try:
                vert = axes.get_vertical_line(axes.i2gp(TAU, cos_graph), color=theme.accent, line_func=Line)
                extras.add(vert)
                extras.add(
                    mk_text("x=2π", font_size=20, color=theme.text).next_to(vert, UR, buff=0.1)
                )
            except Exception:
                pass

        drop_content(VGroup(plot, extras))
        self.play(Create(axes))
        self.play(Create(sin_graph), Create(cos_graph), FadeIn(sin_label), FadeIn(cos_label))
        if len(extras) > 0:
            self.play(FadeIn(extras))
        self.wait(hold)


class ManimPointOnPath(Scene):
    """PointMovingOnShapes — 沿圆/线运动 + 旋转"""

    def construct(self):
        theme = apply_scene_theme(self)
        p = get_params(
            {
                "title": "",
                "circle_radius": 1,
                "path_run_time": 2,
                "rotate_run_time": 1.5,
                "hold_seconds": 0.5,
            }
        )
        radius = float(p.get("circle_radius", 1))
        path_rt = float(p.get("path_run_time", 2))
        rot_rt = float(p.get("rotate_run_time", 1.5))
        hold = float(p.get("hold_seconds", 0.5))

        if p.get("title"):
            self.play(FadeIn(mk_title(str(p["title"]))))

        circle = Circle(radius=radius, color=theme.secondary)
        dot = Dot(color=theme.primary)
        dot2 = dot.copy().shift(RIGHT)
        line = Line([3, 0, 0], [5, 0, 0], color=theme.muted)
        content = VGroup(circle, line, dot)
        drop_content(content)
        self.add(dot)
        self.add(line)
        self.play(GrowFromCenter(circle))
        self.play(Transform(dot, dot2))
        self.play(MoveAlongPath(dot, circle), run_time=path_rt, rate_func=linear)
        self.play(Rotating(dot, about_point=[2, 0, 0]), run_time=rot_rt)
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
                "theta_end": 350,
                "rotation_center": "LEFT",
                "hold_seconds": 0.5,
            }
        )
        hold = float(p.get("hold_seconds", 0.5))
        center_key = str(p.get("rotation_center", "LEFT")).upper()
        center = LEFT if center_key == "LEFT" else RIGHT if center_key == "RIGHT" else ORIGIN

        if p.get("title"):
            self.play(FadeIn(mk_title(str(p["title"]))))

        theta_tracker = ValueTracker(float(p.get("theta_start", 110)))
        line1 = Line(LEFT, RIGHT, color=theme.muted)
        line_moving = Line(LEFT, RIGHT, color=theme.accent)
        line_ref = line_moving.copy()

        def angle_mob():
            lm = line_ref.copy().rotate(theta_tracker.get_value() * DEGREES, about_point=center)
            return Angle(line1, lm, radius=0.5, other_angle=False)

        def tex_mob():
            ang = angle_mob()
            return mk_mathtex(r"\theta", font_size=32, color=theme.text).move_to(
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
        self.wait(0.3)
        self.play(theta_tracker.animate.set_value(float(p.get("theta_mid", 40))))
        self.play(theta_tracker.animate.increment_value(140))
        self.play(tex.animate.set_color(theme.primary), run_time=0.5)
        self.play(theta_tracker.animate.set_value(float(p.get("theta_end", 350))))
        self.wait(hold)


class ManimSineUnitCircle(Scene):
    """SineCurveUnitCircle — 单位圆推导正弦曲线（简化版）"""

    def construct(self):
        theme = apply_scene_theme(self)
        p = get_params(
            {
                "title": "单位圆与正弦曲线",
                "origin_x": -4,
                "run_seconds": 8,
                "hold_seconds": 0.5,
            }
        )
        origin_x = float(p.get("origin_x", -4))
        run_seconds = float(p.get("run_seconds", 8))
        hold = float(p.get("hold_seconds", 0.5))

        if p.get("title"):
            self.play(FadeIn(mk_title(str(p["title"]))))

        origin = np.array([origin_x, 0, 0])
        curve_start = np.array([origin_x + 1, 0, 0])
        x_axis = Line(np.array([-6, 0, 0]), np.array([6, 0, 0]), color=theme.muted)
        y_axis = Line(np.array([origin_x, -2, 0]), np.array([origin_x, 2, 0]), color=theme.muted)
        circle = Circle(radius=1, color=theme.secondary).move_to(origin)
        dot = Dot(radius=0.08, color=theme.accent).move_to(circle.point_from_proportion(0))

        self.t_offset = 0.0
        rate = 0.25 / max(run_seconds / 8.5, 0.1)

        def go_around(mob, dt):
            self.t_offset += dt * rate
            mob.move_to(circle.point_from_proportion(self.t_offset % 1))

        def line_to_axis():
            return Line(origin, dot.get_center(), color=theme.secondary)

        def line_to_curve():
            x = curve_start[0] + self.t_offset * 4
            y = dot.get_center()[1]
            return Line(dot.get_center(), np.array([x, y, 0]), color=theme.accent, stroke_width=2)

        curve = VGroup(Line(curve_start, curve_start))

        def extend_curve():
            last = curve[-1]
            x = curve_start[0] + self.t_offset * 4
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
                "hold_seconds": 0.4,
            }
        )
        ops = [str(o).lower() for o in (p.get("operations") or ["intersection", "union", "exclusion", "difference"])]
        hold = float(p.get("hold_seconds", 0.4))

        if p.get("title"):
            self.play(FadeIn(mk_title(str(p["title"]))))

        ellipse1 = Ellipse(
            width=4.0,
            height=5.0,
            fill_opacity=0.5,
            color=theme.secondary,
            stroke_width=8,
        ).move_to(LEFT * 2.5)
        ellipse2 = ellipse1.copy().set_color(theme.primary).move_to(RIGHT * 0.5)
        header = mk_text(str(p.get("header_label", "Boolean Operation")), font_size=28, color=theme.text)
        header.to_edge(UP)
        base = VGroup(header, ellipse1, ellipse2)
        drop_content(base)
        self.play(FadeIn(header), FadeIn(ellipse1), FadeIn(ellipse2))

        op_defs = {
            "intersection": (Intersection, "Intersection", GREEN),
            "union": (Union, "Union", ORANGE),
            "exclusion": (Exclusion, "Exclusion", YELLOW),
            "difference": (Difference, "Difference", PINK),
        }
        last = None
        for key in ops:
            if key not in op_defs:
                continue
            cls, label, color = op_defs[key]
            shape = cls(ellipse1, ellipse2, color=color, fill_opacity=0.5)
            if last is None:
                self.play(FadeIn(shape.scale(0.35).move_to(RIGHT * 4 + UP * 1.5)))
            else:
                self.play(ReplacementTransform(last, shape.scale(0.35).move_to(RIGHT * 4 + UP * 1.5)))
            last = shape
            txt = mk_text(label, font_size=22).next_to(shape, UP)
            self.play(FadeIn(txt))
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
                "x_max": 10,
                "follow_run_time": 4,
                "hold_seconds": 0.5,
            }
        )
        follow_rt = float(p.get("follow_run_time", 4))
        hold = float(p.get("hold_seconds", 0.5))
        use_camera = hasattr(self, "camera") and hasattr(self.camera, "frame")

        if p.get("title"):
            title = mk_title(str(p["title"]))
            if use_camera:
                self.add(title)
            else:
                self.play(FadeIn(title))

        ax = make_axes(x_range=[-1, float(p.get("x_max", 10))], y_range=[-1.5, 1.5])
        graph = ax.plot(lambda x: np.sin(x), color=theme.secondary, x_range=[0, 3 * PI])
        moving_dot = Dot(ax.i2gp(graph.t_min, graph), color=theme.accent)
        dot_1 = Dot(ax.i2gp(graph.t_min, graph), color=theme.muted)
        dot_2 = Dot(ax.i2gp(graph.t_max, graph), color=theme.muted)
        world = VGroup(ax, graph, dot_1, dot_2, moving_dot)
        drop_content(world)
        self.add(ax, graph, dot_1, dot_2, moving_dot)

        if use_camera:
            self.camera.frame.save_state()
            self.play(self.camera.frame.animate.scale(0.55).move_to(moving_dot))

            def update_frame(_):
                self.camera.frame.move_to(moving_dot.get_center())

            self.camera.frame.add_updater(update_frame)
            self.play(MoveAlongPath(moving_dot, graph, rate_func=linear), run_time=follow_rt)
            self.camera.frame.remove_updater(update_frame)
            self.play(Restore(self.camera.frame))
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
                "x_max": 5,
                "y_max": 6,
                "riemann_x_range": [0.3, 0.6],
                "area_x_range": [2, 3],
                "hold_seconds": 1.0,
            }
        )
        x_max = float(p.get("x_max", 5))
        y_max = float(p.get("y_max", 6))
        hold = float(p.get("hold_seconds", 1.0))
        riemann_rng = p.get("riemann_x_range") or [0.3, 0.6]
        area_rng = p.get("area_x_range") or [2, 3]

        if p.get("title"):
            self.play(FadeIn(mk_title(str(p["title"]))))

        ax = make_axes(x_range=[0, x_max], y_range=[0, y_max])
        curve_1 = ax.plot(lambda x: 4 * x - x ** 2, x_range=[0, min(4, x_max)], color=theme.secondary)
        curve_2 = ax.plot(
            lambda x: 0.8 * x ** 2 - 3 * x + 4,
            x_range=[0, min(4, x_max)],
            color=theme.primary,
        )
        line_1 = ax.get_vertical_line(ax.input_to_graph_point(2, curve_1), color=theme.accent)
        line_2 = ax.get_vertical_line(ax.i2gp(3, curve_1), color=theme.accent)
        riemann_area = ax.get_riemann_rectangles(
            curve_1,
            x_range=[float(riemann_rng[0]), float(riemann_rng[1])],
            dx=0.03,
            color=theme.secondary,
            fill_opacity=0.5,
        )
        area = ax.get_area(
            curve_2,
            [float(area_rng[0]), float(area_rng[1])],
            bounded_graph=curve_1,
            color=theme.muted,
            opacity=0.5,
        )
        plot = VGroup(ax, curve_1, curve_2, line_1, line_2, riemann_area, area)
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
                "x_label": "ΔQ",
                "y_label": "T(°C)",
                "hold_seconds": 1.0,
            }
        )
        x_vals = [float(v) for v in (p.get("x_vals") or [0, 8, 38, 39])]
        y_vals = [float(v) for v in (p.get("y_vals") or [20, 0, 0, -5])]
        hold = float(p.get("hold_seconds", 1.0))

        if p.get("title"):
            self.play(FadeIn(mk_title(str(p["title"]))))

        ax = make_axes(
            x_range=[0, 40, 5],
            y_range=[-8, 32, 5],
            x_length=9,
            y_length=6,
        )
        x_lbl = mk_text(str(p.get("x_label", "ΔQ")), font_size=22).next_to(ax.x_axis, DOWN)
        y_lbl = mk_text(str(p.get("y_label", "T(°C)")), font_size=22).next_to(ax.y_axis, LEFT)
        graph = ax.plot_line_graph(x_values=x_vals, y_values=y_vals, line_color=theme.accent)
        plot = VGroup(ax, x_lbl, y_lbl, graph)
        drop_content(plot)
        self.play(Create(ax), FadeIn(x_lbl), FadeIn(y_lbl))
        self.play(Create(graph))
        self.wait(hold)
