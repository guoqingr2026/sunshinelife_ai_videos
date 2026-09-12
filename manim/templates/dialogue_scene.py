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


class DialogueScene(Scene):
    def construct(self):
        p = get_params({
            "title": "Dialogue",
            "lines": [
                {"speaker": "A", "text": "How do you study vocabulary?"},
                {"speaker": "B", "text": "I use active recall and spaced repetition."},
            ],
        })
        title = mk_title(p["title"], font_size=28)
        self.play(Write(title))
        for i, line in enumerate(p["lines"]):
            side = LEFT * 3 if i % 2 == 0 else RIGHT * 3
            bubble = RoundedRectangle(width=5.5, height=1.2, corner_radius=0.15, color=BLUE if i % 2 == 0 else GREEN, fill_opacity=0.2)
            bubble.move_to(side + DOWN * i * 1.4)
            sp = mk_text(str(line.get("speaker", "?")), font_size=20, color=YELLOW).next_to(bubble, UP, buff=0.1)
            tx = mk_text(str(line.get("text", "")), font_size=22).move_to(bubble)
            self.play(FadeIn(bubble), Write(sp), Write(tx))
        self.wait(1)
