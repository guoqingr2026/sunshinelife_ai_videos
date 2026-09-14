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


class ManimFormula(Scene):
    def construct(self):
        theme = apply_scene_theme(self)
        p = get_params({
            "formula": r"P(\text{win}|\text{switch}) = \frac{2}{3}",
            "steps": [
                r"P(\text{car first}) = \frac{1}{3}",
                r"P(\text{goat first}) = \frac{2}{3}",
            ],
            "title": "贝叶斯推导",
            "formula_font_size": 44,
            "step_font_size": 30,
        })
        title = mk_title(p.get("title", "公式推导"))
        formula_fs = int(p.get("formula_font_size") or 44)
        step_fs = int(p.get("step_font_size") or 30)

        formula_tex = str(p.get("formula", "")).strip()
        formula = mk_mathtex(formula_tex, font_size=formula_fs, color=theme.accent)
        drop_content(formula)
        formula.next_to(title, DOWN, buff=0.55)

        steps = p.get("steps") or []
        step_group = VGroup()
        for i, s in enumerate(steps):
            raw = str(s).strip()
            is_last = i == len(steps) - 1
            color = theme.accent if is_last else theme.text
            if looks_like_latex(raw):
                t = mk_mathtex(raw, font_size=step_fs, color=color)
            else:
                t = mk_text(f"{i + 1}. {raw}", font_size=step_fs - 2, color=color)
            step_group.add(t)
        if len(step_group) > 0:
            step_group.arrange(DOWN, aligned_edge=LEFT, buff=0.32)
            step_group.next_to(formula, DOWN, buff=0.55)

        self.play(Write(title))
        self.play(Write(formula))
        for t in step_group:
            self.play(FadeIn(t, shift=RIGHT * 0.15), run_time=0.55)

        if not latex_available() and (
            looks_like_latex(formula_tex) or any(looks_like_latex(s) for s in steps)
        ):
            hint = mk_text(
                "安装 texlive 可显示专业 LaTeX 公式（deploy/ecs/install-texlive-optional.sh）",
                font_size=16,
                color=theme.muted,
            ).to_edge(DOWN)
            self.play(FadeIn(hint), run_time=0.35)

        self.wait(1)
