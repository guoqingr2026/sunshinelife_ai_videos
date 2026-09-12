"""Axes/plots without LaTeX (no texlive on ECS)."""
from manim import Axes, NumberPlane, Rectangle, VGroup, DOWN, LEFT, RIGHT, UP
from templates._text import mk_text

_NO_TEX = {"include_numbers": False, "include_tip": False, "font_size": 20}


def make_axes(*args, **kwargs):
    kwargs.setdefault("axis_config", dict(_NO_TEX))
    kwargs.setdefault("x_axis_config", dict(_NO_TEX))
    kwargs.setdefault("y_axis_config", dict(_NO_TEX))
    return Axes(*args, **kwargs)


def make_number_plane(*args, **kwargs):
    kwargs.setdefault("axis_config", dict(_NO_TEX))
    kwargs.setdefault("x_axis_config", dict(_NO_TEX))
    kwargs.setdefault("y_axis_config", dict(_NO_TEX))
    return NumberPlane(*args, **kwargs)


def make_bar_chart(values, names=None, y_max=None, width=8, height=4, colors=None):
    """Pure Rectangle bars — avoids Manim BarChart LaTeX axis labels."""
    values = [float(v) for v in values]
    names = names or [str(i + 1) for i in range(len(values))]
    y_max = y_max or max(max(values) * 1.2, 1.0)
    colors = colors or []
    group = VGroup()
    n = len(values)
    slot = width / max(n, 1)
    bar_w = slot * 0.65
    origin_y = -height / 2
    for i, v in enumerate(values):
        h = height * (v / y_max) if y_max else 0.01
        color = colors[i % len(colors)] if colors else "#58a6ff"
        rect = Rectangle(width=bar_w, height=max(h, 0.05), color=color, fill_opacity=0.85, stroke_width=1)
        x = -width / 2 + slot * (i + 0.5)
        rect.move_to([x, origin_y + h / 2, 0])
        group.add(rect)
        if i < len(names):
            lbl = mk_text(str(names[i]), font_size=18).next_to(rect, DOWN, buff=0.15)
            group.add(lbl)
    return group
