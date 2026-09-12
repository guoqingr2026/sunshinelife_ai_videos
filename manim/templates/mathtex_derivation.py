import importlib.util
import os
_spec = importlib.util.spec_from_file_location('templates._path', os.path.join(os.path.dirname(__file__), '_path.py'))
_path_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_path_mod)

from manim import *
from templates._no_tex import apply_no_tex
apply_no_tex()

from templates._params import get_params
from templates._layout import mk_title
from templates._tex import mk_mathtex


class MathTexDerivation(Scene):
    def construct(self):
        p = get_params({
            "title": "Derivation",
            "steps": [r"V = IR", r"I = \frac{V}{R}", r"P = VI"],
        })
        title = mk_title(p["title"])
        items = VGroup()
        for i, s in enumerate(p["steps"]):
            t = mk_mathtex(str(s), font_size=36, color=YELLOW if i == len(p["steps"]) - 1 else WHITE)
            t.shift(DOWN * (i * 0.8 + 0.3))
            items.add(t)
        self.play(Write(title))
        for t in items:
            self.play(Write(t))
        self.wait(1)
