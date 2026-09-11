from manim import *
from templates._params import get_params


class KeywordPop(Scene):
    def construct(self):
        p = get_params({"keywords": ["理解", "记忆", "应用", "反馈"]})
        words = VGroup()
        colors = [YELLOW, GREEN, BLUE, RED]
        for i, kw in enumerate(p["keywords"]):
            w = Text(str(kw), font_size=36, color=colors[i % len(colors)])
            w.shift(UP * (1.5 - i * 1))
            words.add(w)
        title = Text("关键词高亮", font_size=28).to_edge(UP)
        self.play(Write(title))
        for w in words:
            self.play(FadeIn(w, scale=0.5), w.animate.scale(1.1), run_time=0.5)
            self.play(w.animate.scale(1 / 1.1), run_time=0.2)
        self.wait(0.5)
