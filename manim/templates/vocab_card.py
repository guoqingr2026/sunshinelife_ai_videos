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


class VocabCard(Scene):
    def construct(self):
        p = get_params({
            "title": "Vocabulary",
            "word": "recall",
            "phonetic": "/rI'ko:l/",
            "meaning": "to remember",
            "example": "Active recall improves memory.",
        })
        title = mk_title(p["title"], font_size=28)
        card = RoundedRectangle(width=9, height=4.5, corner_radius=0.2, color=BLUE, fill_opacity=0.15)
        word = mk_text(p["word"], font_size=52, color=YELLOW)
        phon = mk_text(p["phonetic"], font_size=26, color=GRAY)
        mean = mk_text(p["meaning"], font_size=30)
        ex = mk_text(p["example"], font_size=22, color=GREEN)
        word.move_to(card.get_center() + UP * 1.2)
        phon.next_to(word, DOWN, buff=0.2)
        mean.next_to(phon, DOWN, buff=0.35)
        ex.next_to(mean, DOWN, buff=0.35)
        group = VGroup(card, word, phon, mean, ex)
        self.play(Write(title), FadeIn(card))
        self.play(Write(word), Write(phon))
        self.play(FadeIn(mean, shift=UP * 0.2))
        self.play(AddTextLetterByLetter(ex, time_per_char=0.04))
        self.wait(1)
