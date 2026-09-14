import importlib.util
import os
_spec = importlib.util.spec_from_file_location('templates._path', os.path.join(os.path.dirname(__file__), '_path.py'))
_path_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_path_mod)

from manim import *
from templates._no_tex import apply_no_tex
apply_no_tex()

from templates._params import get_params
from templates._layout import mk_title, drop_content
from templates._theme import apply_scene_theme
from templates._tex import latex_available, looks_like_latex, mk_mathtex
from templates._text import mk_text


class FormulaSteps(Scene):
    def construct(self):
        theme = apply_scene_theme(self)
        p = get_params({
            "steps": [r"P = VI", r"V = IR", r"P = I^2 R"],
            "title": "Formulas",
            "step_font_size": 34,
        })
        title = mk_title(p["title"])
        step_fs = int(p.get("step_font_size") or 34)
        items = VGroup()
        steps = p.get("steps") or []
        for i, s in enumerate(steps):
            raw = str(s).strip()
            is_last = i == len(steps) - 1
            color = theme.accent if is_last else theme.text
            if looks_like_latex(raw):
                t = mk_mathtex(raw, font_size=step_fs, color=color)
            else:
                t = mk_text(raw, font_size=step_fs, color=color)
            items.add(t)
        if len(items) > 0:
            items.arrange(DOWN, aligned_edge=LEFT, buff=0.45)
            drop_content(items)

        self.play(Write(title))
        for t in items:
            self.play(Write(t), run_time=0.65)

        if not latex_available() and any(looks_like_latex(s) for s in steps):
            hint = mk_text(
                "安装 texlive 可显示 LaTeX 公式",
                font_size=16,
                color=theme.muted,
            ).to_edge(DOWN)
            self.play(FadeIn(hint), run_time=0.35)

        self.wait(1)
