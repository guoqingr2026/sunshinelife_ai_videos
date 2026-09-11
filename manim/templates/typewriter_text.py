from manim import *
from templates._text import mk_text
from templates._params import get_params


class TypewriterText(Scene):
    def construct(self):
        p = get_params({"text": "主动回忆 · 间隔重复", "subtitle": "学习技�?})
        title = mk_text(p["subtitle"], font_size=28, color=GRAY).to_edge(UP)
        body = mk_text(p["text"], font_size=40)
        self.play(Write(title))
        self.play(AddTextLetterByLetter(body, time_per_char=0.08))
        self.wait(1)
