import importlib.util
import os
_spec = importlib.util.spec_from_file_location('templates._path', os.path.join(os.path.dirname(__file__), '_path.py'))
_path_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_path_mod)

from manim import *
from templates._text import mk_text
from templates._params import get_params


class ChapterBanner(Scene):
    def construct(self):
        p = get_params({"chapter": "第一�?, "title": "半导体基础"})
        bar = Rectangle(width=12, height=1.2, color=BLUE, fill_opacity=0.4).to_edge(UP, buff=1)
        ch = mk_text(p["chapter"], font_size=28, color=YELLOW).move_to(bar)
        main = mk_text(p["title"], font_size=48).shift(DOWN * 0.5)
        self.play(FadeIn(bar), Write(ch))
        self.play(Write(main))
        self.wait(1)
