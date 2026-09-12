import importlib.util
import os
_spec = importlib.util.spec_from_file_location('templates._path', os.path.join(os.path.dirname(__file__), '_path.py'))
_path_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_path_mod)

from manim import *
from templates._text import mk_text
from templates._params import get_params
from templates._layout import mk_title


class TypewriterText(Scene):
    def construct(self):
        p = get_params({"text": "???? ? ????", "subtitle": "????"})
        title = mk_title(p["subtitle"], font_size=28)
        body = mk_text(p["text"], font_size=40).shift(DOWN * 0.4)
        self.play(Write(title))
        self.play(AddTextLetterByLetter(body, time_per_char=0.08))
        self.wait(1)
