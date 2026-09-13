"""Remotion theme colors → Manim scene background & text contrast."""
from __future__ import annotations

from dataclasses import dataclass

from manim import BLACK, WHITE, rgb_to_color

from templates._params import get_params

_THEME_KEYS = (
    "backgroundColor",
    "primaryColor",
    "secondaryColor",
    "accentColor",
    "background",
    "primary",
    "secondary",
    "accent",
)

_ctx: dict[str, "ThemeColors | None"] = {"current": None}


def _parse_hex(hex_str: str):
    h = str(hex_str).strip().lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    if len(h) != 6:
        return None
    try:
        r = int(h[0:2], 16) / 255.0
        g = int(h[2:4], 16) / 255.0
        b = int(h[4:6], 16) / 255.0
        return (r, g, b)
    except ValueError:
        return None


def hex_to_color(hex_str: str, fallback=None):
    rgb = _parse_hex(hex_str)
    if rgb is None:
        return fallback if fallback is not None else BLACK
    return rgb_to_color(rgb)


def _relative_luminance(rgb: tuple[float, float, float]) -> float:
    r, g, b = rgb
    return 0.299 * r + 0.587 * g + 0.114 * b


def _pick_text_color(bg_rgb: tuple[float, float, float]):
    if _relative_luminance(bg_rgb) > 0.55:
        return rgb_to_color((0.12, 0.14, 0.18))
    return WHITE


def _pick_muted_color(bg_rgb: tuple[float, float, float]):
    if _relative_luminance(bg_rgb) > 0.55:
        return rgb_to_color((0.35, 0.4, 0.48))
    return rgb_to_color((0.65, 0.68, 0.75))


def _extract_theme_dict(params: dict) -> dict:
    out: dict = {}
    nested = params.get("theme")
    if isinstance(nested, dict):
        out.update(nested)
    for key in _THEME_KEYS:
        if key in params and params[key]:
            out[key] = params[key]
    return out


@dataclass
class ThemeColors:
    background: object
    primary: object
    secondary: object
    accent: object
    text: object
    muted: object
    bg_rgb: tuple[float, float, float]

    @classmethod
    def from_params(cls, params: dict | None = None) -> "ThemeColors":
        p = params if params is not None else get_params()
        t = _extract_theme_dict(p)

        bg_hex = str(t.get("backgroundColor") or t.get("background") or "").strip()
        bg_rgb = _parse_hex(bg_hex) if bg_hex else None
        background = hex_to_color(bg_hex, BLACK) if bg_hex else BLACK
        if bg_rgb is None:
            bg_rgb = (0.0, 0.0, 0.0)

        primary = hex_to_color(
            str(t.get("primaryColor") or t.get("primary") or "#fb7299"),
            rgb_to_color((0.98, 0.45, 0.6)),
        )
        secondary = hex_to_color(
            str(t.get("secondaryColor") or t.get("secondary") or "#23ade5"),
            rgb_to_color((0.14, 0.68, 0.9)),
        )
        accent = hex_to_color(
            str(t.get("accentColor") or t.get("accent") or "#ffe066"),
            rgb_to_color((1.0, 0.88, 0.4)),
        )
        text = _pick_text_color(bg_rgb)
        muted = _pick_muted_color(bg_rgb)
        return cls(
            background=background,
            primary=primary,
            secondary=secondary,
            accent=accent,
            text=text,
            muted=muted,
            bg_rgb=bg_rgb,
        )


def theme_colors() -> ThemeColors:
    if _ctx["current"] is None:
        _ctx["current"] = ThemeColors.from_params()
    return _ctx["current"]


def apply_scene_theme(scene, params: dict | None = None) -> ThemeColors:
    """Set camera background from theme; call at start of Scene.construct()."""
    colors = ThemeColors.from_params(params)
    _ctx["current"] = colors
    scene.camera.background_color = colors.background
    return colors


def reset_theme_context() -> None:
    _ctx["current"] = None
