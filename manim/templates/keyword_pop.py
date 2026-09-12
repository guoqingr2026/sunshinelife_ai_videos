import importlib.util
import os
_spec = importlib.util.spec_from_file_location('templates._path', os.path.join(os.path.dirname(__file__), '_path.py'))
_path_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_path_mod)

from manim import *
from templates._text import mk_text
from templates._params import get_params
from templates._layout import mk_title


class KeywordPop(Scene):
    def construct(self):
        p = get_params({"keywords": ["A", "B", "C", "D"], "title": "Keywords"})
        title = mk_title(p["title"], font_size=28)
        words = VGroup()
        colors = [YELLOW, GREEN, BLUE, RED]
        positions = [LEFT * 2.5, LEFT * 0.8, RIGHT * 0.8, RIGHT * 2.5]
        for i, kw in enumerate(p["keywords"][:4]):
            w = mk_text(str(kw), font_size=34, color=colors[i % len(colors)])
            w.move_to(positions[i] + DOWN * 0.3)
            words.add(w)
        self.play(Write(title))
        for w in words:
            self.play(FadeIn(w, scale=0.5), w.animate.scale(1.08), run_time=0.45)
            self.play(w.animate.scale(1 / 1.08), run_time=0.15)
        self.wait(0.5)
