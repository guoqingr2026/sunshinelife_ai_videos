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


class CodeHighlight(Scene):
    def construct(self):
        p = get_params({
            "title": "Code",
            "lines": ["def learn():", "    return 'active recall'", "learn()"],
            "highlight_line": 2,
        })
        title = mk_title(p["title"])
        lines = p["lines"]
        hi = int(p.get("highlight_line", 1))
        block = VGroup()
        for i, line in enumerate(lines):
            color = YELLOW if (i + 1) == hi else GRAY
            t = mk_text(str(line), font_size=22, color=color, font="Courier New")
            t.align_to(ORIGIN, LEFT)
            t.shift(DOWN * i * 0.45)
            block.add(t)
        block.shift(DOWN * 0.3)
        self.play(Write(title))
        for t in block:
            self.play(FadeIn(t, shift=RIGHT * 0.2), run_time=0.35)
        self.wait(1)
