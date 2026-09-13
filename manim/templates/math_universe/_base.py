"""数学宇宙场景共用：主题、标题、曲线展示。"""
from __future__ import annotations

from manim import DOWN, Create, DEGREES, DR, FadeIn, Write

from templates._curves import fit_curve_group
from templates._layout import drop_content, mk_title
from templates._text import mk_text
from templates._theme import apply_scene_theme


def play_2d_curve(
    self,
    curve,
    title: str,
    subtitle: str = "",
    theme=None,
    params: dict | None = None,
):
    p = params or {}
    if theme is None:
        theme = apply_scene_theme(self)
    else:
        self.camera.background_color = theme.background
    hdr = mk_title(title)
    fit_curve_group(curve)
    drop_content(curve)
    intro_rt = float(p.get("intro_run_time", 0.8))
    curve_rt = float(p.get("curve_run_time", 2.2))
    hold = float(p.get("hold_seconds", p.get("tail_wait", 0.8)))
    self.play(Write(hdr), run_time=intro_rt)
    self.play(Create(curve), run_time=curve_rt)
    if subtitle:
        cap = mk_text(subtitle, font_size=22, color=theme.muted)
        cap.to_edge(DOWN, buff=0.45)
        self.play(FadeIn(cap))
    self.wait(hold)


def play_3d_intro(
    self,
    mobj,
    title: str,
    subtitle: str = "",
    rotate: bool = True,
    params: dict | None = None,
):
    p = params or {}
    theme = apply_scene_theme(self)
    hdr = mk_title(title)
    intro_rt = float(p.get("intro_run_time", p.get("run_time", 2.5)))
    rotate_secs = float(p.get("rotate_seconds", p.get("hold_seconds", 2)))
    tail_wait = float(p.get("tail_wait", 0.5))
    rotate_rate = float(p.get("rotate_rate", 0.12))
    self.add_fixed_in_frame_mobjects(hdr)
    self.set_camera_orientation(phi=70 * DEGREES, theta=35 * DEGREES)
    self.play(Write(hdr), Create(mobj), run_time=intro_rt)
    if subtitle:
        lbl = mk_text(subtitle, font_size=20, color=theme.muted)
        lbl.to_corner(DR)
        self.add_fixed_in_frame_mobjects(lbl)
        self.play(FadeIn(lbl))
    if rotate:
        self.begin_ambient_camera_rotation(rate=rotate_rate)
        self.wait(rotate_secs)
        self.stop_ambient_camera_rotation()
    self.wait(tail_wait)
