import importlib.util
import os
_spec = importlib.util.spec_from_file_location('templates._path', os.path.join(os.path.dirname(__file__), '_path.py'))
_path_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_path_mod)

from manim import *
from templates._no_tex import apply_no_tex
apply_no_tex()

from templates._params import get_params
from templates._layout import mk_title, drop_content
from templates._text import mk_text


class CircuitLoop(Scene):
    def construct(self):
        p = get_params({"title": "Circuit Loop", "voltage": "12V", "component": "R1"})
        title = mk_title(p["title"])
        w, h = 5, 3
        path = VGroup(
            Line([-w / 2, h / 2, 0], [w / 2, h / 2, 0], color=WHITE),
            Line([w / 2, h / 2, 0], [w / 2, -h / 2, 0], color=WHITE),
            Line([w / 2, -h / 2, 0], [-w / 2, -h / 2, 0], color=WHITE),
            Line([-w / 2, -h / 2, 0], [-w / 2, h / 2, 0], color=WHITE),
        )
        battery = mk_text(p["voltage"], font_size=22, color=YELLOW).move_to([-w / 2, 0, 0])
        resistor = Rectangle(width=1.2, height=0.5, color=BLUE, fill_opacity=0.3).move_to([0, h / 2, 0])
        r_lbl = mk_text(p["component"], font_size=20).move_to(resistor)
        arrow = Arrow([w / 4, -h / 2, 0], [w / 2, -h / 2, 0], buff=0, color=GREEN)
        body = VGroup(path, battery, resistor, r_lbl, arrow)
        drop_content(body)
        self.play(Write(title))
        self.play(Create(path), Write(battery), FadeIn(resistor), Write(r_lbl))
        self.play(GrowArrow(arrow))
        self.wait(1)
