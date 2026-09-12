import importlib.util
import os
_spec = importlib.util.spec_from_file_location('templates._path', os.path.join(os.path.dirname(__file__), '_path.py'))
_path_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_path_mod)

from manim import *
from templates._no_tex import apply_no_tex
apply_no_tex()

from templates._text import mk_text
from templates._params import get_params
from templates._layout import mk_title


class FormulaSteps(Scene):
    def construct(self):
        p = get_params({"steps": ["P = V * I", "V = I * R", "P = I^2 * R"], "title": "Formulas"})
        title = mk_title(p["title"])
        items = VGroup()
        for i, s in enumerate(p["steps"]):
            t = mk_text(str(s), font_size=32, color=YELLOW if i == len(p["steps"]) - 1 else WHITE)
            t.shift(DOWN * (i * 0.9 + 0.5))
            items.add(t)
        self.play(Write(title))
        for t in items:
            self.play(FadeIn(t, shift=RIGHT * 0.3))
        self.wait(1)
