from manim import *
from templates._text import mk_text
from templates._params import get_params


class FormulaSteps(Scene):
    def construct(self):
        p = get_params({"steps": ["P = V × I", "V = I × R", "P = I² × R"]})
        title = mk_text("公式拆解", font_size=32).to_edge(UP)
        items = VGroup()
        for i, s in enumerate(p["steps"]):
            t = mk_text(str(s), font_size=32, color=YELLOW if i == len(p["steps"]) - 1 else WHITE)
            t.shift(DOWN * i * 0.9)
            items.add(t)
        self.play(Write(title))
        for t in items:
            self.play(FadeIn(t, shift=RIGHT * 0.3))
        self.wait(1)
