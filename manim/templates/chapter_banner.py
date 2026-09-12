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


class ChapterBanner(Scene):
    def construct(self):
        p = get_params({"chapter": "Chapter 1", "title": "Semiconductor Basics"})
        title = mk_title(p["chapter"], font_size=28)
        bar = Rectangle(width=10, height=1.0, color=BLUE, fill_opacity=0.35)
        bar.next_to(title, DOWN, buff=0.35)
        main = mk_text(p["title"], font_size=44).next_to(bar, DOWN, buff=0.5)
        self.play(Write(title), FadeIn(bar))
        self.play(Write(main))
        self.wait(1)
