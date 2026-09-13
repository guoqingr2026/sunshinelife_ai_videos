"""Manim 数学曲线宇宙 — 通过 manim_custom + params.scene 调度。"""

from templates.math_universe.registry import (
    list_universe_scenes,
    resolve_universe_scene,
    scene_needs_opengl,
)

__all__ = ["list_universe_scenes", "resolve_universe_scene", "scene_needs_opengl"]
