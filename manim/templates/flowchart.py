import importlib.util
import os
_spec = importlib.util.spec_from_file_location('templates._path', os.path.join(os.path.dirname(__file__), '_path.py'))
_path_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_path_mod)

from manim import *
from templates._text import mk_text
from templates._params import get_params
from templates._layout import mk_title, drop_content


class FlowchartSimple(Scene):
    def construct(self):
        p = get_params({"steps": ["Input", "Process", "Output"], "title": "Flowchart"})
        steps = p["steps"]
        title = mk_title(p["title"])
        boxes = VGroup()
        for i, s in enumerate(steps):
            box = RoundedRectangle(width=2.4, height=0.9, corner_radius=0.15, color=BLUE, fill_opacity=0.2)
            box.shift(DOWN * i * 1.4)
            txt = mk_text(str(s), font_size=22).move_to(box)
            boxes.add(VGroup(box, txt))
        drop_content(boxes, amount=0.2)
        arrows = VGroup()
        for i in range(len(boxes) - 1):
            arrows.add(Arrow(boxes[i].get_bottom(), boxes[i + 1].get_top(), buff=0.12, color=YELLOW))
        self.play(Write(title))
        for b in boxes:
            self.play(FadeIn(b))
        self.play(LaggedStart(*[GrowArrow(a) for a in arrows], lag_ratio=0.3))
        self.wait(1)
