"""Axes helpers for headless ECS without LaTeX."""
from manim import Axes, BarChart

_NO_TEX_AXIS = {"include_numbers": False, "include_tip": False}


def make_axes(*args, **kwargs):
    """Axes without MathTex number labels (no latex required)."""
    kwargs.setdefault("axis_config", {})
    if isinstance(kwargs["axis_config"], dict):
        kwargs["axis_config"].setdefault("include_numbers", False)
    kwargs.setdefault("x_axis_config", dict(_NO_TEX_AXIS))
    kwargs.setdefault("y_axis_config", dict(_NO_TEX_AXIS))
    return Axes(*args, **kwargs)


def make_bar_chart(values, **kwargs):
    """BarChart without LaTeX axis numbers."""
    kwargs.setdefault("y_axis_config", dict(_NO_TEX_AXIS))
    kwargs.setdefault("x_axis_config", dict(_NO_TEX_AXIS))
    return BarChart(values, **kwargs)
