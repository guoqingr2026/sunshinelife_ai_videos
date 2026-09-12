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
from templates._text import mk_text


class GrammarHighlight(Scene):
    def construct(self):
        p = get_params({
            "title": "Grammar",
            "pattern": "S + V + O",
            "sentence": "I love learning English.",
            "highlight": "love",
        })
        title = mk_title(p["title"], font_size=28)
        pattern = mk_text(p["pattern"], font_size=32, color=YELLOW)
        sent = mk_text(p["sentence"], font_size=36)
        pattern.next_to(title, DOWN, buff=0.5)
        sent.next_to(pattern, DOWN, buff=0.6)
        box = SurroundingRectangle(sent, color=GREEN, buff=0.15)
        self.play(Write(title), Write(pattern))
        self.play(Write(sent), Create(box))
        hi = p.get("highlight", "")
        if hi and hi in p["sentence"]:
            self.play(Indicate(sent, color=YELLOW))
        self.wait(1)
