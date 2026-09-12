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
from templates._tex import mk_mathtex, latex_available
from templates._text import mk_text


class MathTexFormula(Scene):
    def construct(self):
        p = get_params({
            "title": "Formula",
            "formula": r"E = mc^2",
            "caption": "",
        })
        title = mk_title(p["title"])
        formula = mk_mathtex(p["formula"], font_size=48)
        drop_content(formula)
        self.play(Write(title))
        self.play(Write(formula))
        if p.get("caption"):
            cap = mk_text(p["caption"], font_size=22, color=GRAY).next_to(formula, DOWN, buff=0.4)
            self.play(FadeIn(cap))
        if not latex_available():
            hint = mk_text("(text fallback — install texlive for MathTex)", font_size=16, color=YELLOW).to_edge(DOWN)
            self.play(FadeIn(hint))
        self.wait(1)
