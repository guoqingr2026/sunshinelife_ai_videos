"""Parametric / polar curve builders for math curve templates."""
from __future__ import annotations

import math

import numpy as np
from manim import PI, TAU, VMobject


def build_polar_curve(r_func, t_min: float, t_max: float, n: int = 400, color=None, width: float = 4):
    ts = np.linspace(t_min, t_max, n)
    pts = []
    for t in ts:
        r = float(r_func(t))
        if not np.isfinite(r):
            continue
        pts.append([r * math.cos(t), r * math.sin(t), 0])
    if len(pts) < 2:
        pts = [[0, 0, 0], [0.2, 0, 0]]
    curve = VMobject()
    curve.set_points_smoothly(pts)
    curve.set_stroke(color=color, width=width)
    return curve


def build_parametric(x_fn, y_fn, t_min: float, t_max: float, n: int = 400, color=None, width: float = 4):
    ts = np.linspace(t_min, t_max, n)
    pts = [[float(x_fn(t)), float(y_fn(t)), 0] for t in ts]
    curve = VMobject()
    curve.set_points_smoothly(pts)
    curve.set_stroke(color=color, width=width)
    return curve


def lorenz_initial_conditions(
    n: int = 1,
    perturbation: float = 0.35,
    custom: list | None = None,
):
    """Return up to n (x0, y0, z0) tuples for Lorenz integration."""
    n = max(1, min(int(n), 16))
    if custom:
        out = []
        for item in custom[:n]:
            if isinstance(item, (list, tuple)) and len(item) >= 3:
                out.append((float(item[0]), float(item[1]), float(item[2])))
        if out:
            return out
    return [(0.1 + i * perturbation, 0.0, 0.0) for i in range(n)]


def build_lorenz_path(
    steps: int = 4000,
    dt: float = 0.008,
    sigma: float = 10.0,
    rho: float = 28.0,
    beta: float = 8.0 / 3.0,
    scale: float = 0.07,
    x0: float = 0.1,
    y0: float = 0.0,
    z0: float = 0.0,
):
    x, y, z = float(x0), float(y0), float(z0)
    pts = []
    for _ in range(steps):
        dx = sigma * (y - x)
        dy = x * (rho - z) - y
        dz = x * y - beta * z
        x += dx * dt
        y += dy * dt
        z += dz * dt
        pts.append([x * scale, y * scale, z * scale])
    curve = VMobject()
    curve.set_points_smoothly(pts)
    curve.set_stroke(width=2)
    return curve


def _lorenz_trajectory_count(params: dict) -> int:
    raw = params.get("n", params.get("trajectory_count", 1))
    try:
        return max(1, min(int(raw), 16))
    except (TypeError, ValueError):
        return 1


def _lorenz_colors(params: dict, theme, count: int):
    from templates._theme import hex_to_color

    raw = params.get("colors")
    if isinstance(raw, list) and raw:
        palette = [hex_to_color(str(c), theme.primary) for c in raw]
        return [palette[i % len(palette)] for i in range(count)]
    palette = [theme.primary, theme.secondary, theme.accent, theme.muted]
    return [palette[i % len(palette)] for i in range(count)]


def build_lorenz_group(params: dict, theme):
    """Build 1..n Lorenz trajectories with distinct colors."""
    from manim import VGroup

    count = _lorenz_trajectory_count(params)
    custom = params.get("initial_conditions")
    if not isinstance(custom, list):
        custom = None
    perturbation = float(params.get("perturbation", 0.35))
    inits = lorenz_initial_conditions(count, perturbation=perturbation, custom=custom)
    colors = _lorenz_colors(params, theme, count)
    steps = int(params.get("steps", 4000))
    dt = float(params.get("dt", 0.008))
    group = VGroup()
    for i, (x0, y0, z0) in enumerate(inits):
        path = build_lorenz_path(steps=steps, dt=dt, x0=x0, y0=y0, z0=z0)
        path.set_color(colors[i])
        group.add(path)
    return group


def mandelbrot_rgba(
    width: int = 320,
    height: int = 240,
    xmin: float = -2.2,
    xmax: float = 0.8,
    ymin: float = -1.2,
    ymax: float = 1.2,
    max_iter: int = 64,
) -> np.ndarray:
    """RGBA uint8 image for ImageMobject."""
    img = np.zeros((height, width, 4), dtype=np.uint8)
    xs = np.linspace(xmin, xmax, width)
    ys = np.linspace(ymin, ymax, height)
    for j, y0 in enumerate(ys):
        for i, x0 in enumerate(xs):
            c = complex(x0, y0)
            z = 0j
            n = 0
            while abs(z) <= 2 and n < max_iter:
                z = z * z + c
                n += 1
            if n >= max_iter:
                img[j, i] = [20, 20, 40, 255]
            else:
                t = n / max_iter
                img[j, i] = [
                    int(40 + 180 * t),
                    int(60 + 120 * (1 - t)),
                    int(180 + 60 * t),
                    255,
                ]
    return img


def julia_rgba(
    c_real: float = -0.7,
    c_imag: float = 0.27015,
    width: int = 320,
    height: int = 240,
    xmin: float = -1.5,
    xmax: float = 1.5,
    ymin: float = -1.5,
    ymax: float = 1.5,
    max_iter: int = 64,
) -> np.ndarray:
    c = complex(c_real, c_imag)
    img = np.zeros((height, width, 4), dtype=np.uint8)
    xs = np.linspace(xmin, xmax, width)
    ys = np.linspace(ymin, ymax, height)
    for j, y0 in enumerate(ys):
        for i, x0 in enumerate(xs):
            z = complex(x0, y0)
            n = 0
            while abs(z) <= 2 and n < max_iter:
                z = z * z + c
                n += 1
            if n >= max_iter:
                img[j, i] = [15, 10, 35, 255]
            else:
                t = n / max_iter
                img[j, i] = [
                    int(50 + 200 * t),
                    int(30 + 100 * (1 - t)),
                    int(120 + 100 * t),
                    255,
                ]
    return img


def fit_curve_group(curve, max_size: float = 5.5):
    curve.scale_to_fit_width(max_size)
    if curve.height > max_size:
        curve.scale_to_fit_height(max_size)
    return curve.center()
