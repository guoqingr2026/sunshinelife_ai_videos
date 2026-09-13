import importlib.util
import os
import math
_spec = importlib.util.spec_from_file_location('templates._path', os.path.join(os.path.dirname(__file__), '_path.py'))
_path_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_path_mod)

from manim import *
from templates._no_tex import apply_no_tex
apply_no_tex()

from templates._text import mk_text
from templates._params import get_params
from templates._layout import mk_title, drop_content
from templates._axes import make_axes


class ManimSimulationChart(Scene):
    def construct(self):
        p = get_params({
            "trials": 10000,
            "chartType": "line",
            "targetValue": 0.666,
            "description": "模拟胜率收敛",
            "title": "蒙特卡洛模拟",
        })
        title = mk_title(p.get("title", "模拟实验"))
        target = float(p.get("targetValue", 0.666))
        desc = str(p.get("description", ""))

        axes = make_axes(x_range=[0, 10, 2], y_range=[0, 1, 0.25], x_length=8, y_length=4)
        # 收敛曲线：从 0.5 渐近到 target
        curve = axes.plot(
            lambda x: target - (target - 0.5) * math.exp(-0.6 * x),
            color=BLUE,
        )
        target_line = DashedLine(
            axes.c2p(0, target),
            axes.c2p(10, target),
            color=YELLOW,
        )
        target_lbl = mk_text(f"{target:.1%}", font_size=20, color=YELLOW)
        target_lbl.next_to(axes.c2p(10, target), RIGHT, buff=0.2)

        chart = VGroup(axes, curve, target_line, target_lbl)
        drop_content(chart)

        desc_text = mk_text(desc, font_size=22, color=GRAY)
        desc_text.to_edge(DOWN, buff=0.5)

        self.play(Write(title), Create(axes))
        self.play(Create(curve), Create(target_line), Write(target_lbl))
        if desc:
            self.play(FadeIn(desc_text))
        self.wait(1)
