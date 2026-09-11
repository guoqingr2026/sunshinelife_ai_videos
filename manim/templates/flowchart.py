from manim import *
from templates._text import mk_text
from templates._params import get_params


class FlowchartSimple(Scene):
    def construct(self):
        p = get_params({"steps": ["输入", "处理", "输出"]})
        steps = p["steps"]
        boxes = VGroup()
        for i, s in enumerate(steps):
            box = RoundedRectangle(width=2.2, height=0.9, corner_radius=0.15, color=BLUE, fill_opacity=0.2)
            box.shift(DOWN * i * 1.5)
            txt = mk_text(str(s), font_size=22).move_to(box)
            boxes.add(VGroup(box, txt))
        arrows = VGroup()
        for i in range(len(boxes) - 1):
            arrows.add(Arrow(boxes[i].get_bottom(), boxes[i + 1].get_top(), buff=0.1, color=YELLOW))
        title = mk_text("流程�?, font_size=32).to_edge(UP)
        self.play(Write(title))
        for b in boxes:
            self.play(FadeIn(b))
        self.play(LaggedStart(*[GrowArrow(a) for a in arrows], lag_ratio=0.3))
        self.wait(1)
