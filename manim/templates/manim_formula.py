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


class ManimFormula(Scene):
    def construct(self):
        p = get_params({
            "formula": "P(赢车|换门) = 2/3",
            "steps": [
                "第一次选中汽车概率 = 1/3",
                "第一次选中山羊概率 = 2/3",
                "主持人行为提供额外信息",
                "换门等于抓住 2/3 的概率空间",
            ],
            "title": "贝叶斯推导",
        })
        title = mk_title(p.get("title", "公式推导"))
        formula = mk_text(str(p.get("formula", "")), font_size=40, color=YELLOW)
        formula.next_to(title, DOWN, buff=0.8)

        steps = p.get("steps") or []
        step_group = VGroup()
        for i, s in enumerate(steps):
            t = mk_text(f"{i+1}. {s}", font_size=24, color=WHITE)
            t.align_to(formula, LEFT)
            step_group.add(t)
        step_group.arrange(DOWN, aligned_edge=LEFT, buff=0.35)
        step_group.next_to(formula, DOWN, buff=0.6)

        self.play(Write(title))
        self.play(FadeIn(formula, scale=1.1))
        for t in step_group:
            self.play(FadeIn(t, shift=RIGHT * 0.2), run_time=0.6)
        self.wait(1)
