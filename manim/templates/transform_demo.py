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


class TransformDemo(Scene):
    def construct(self):
        p = get_params({"title": "Transform Demo", "from_shape": "square", "to_shape": "circle"})
        title = mk_title(p["title"])
        a = Square(side_length=2, color=BLUE, fill_opacity=0.4) if p["from_shape"] == "square" else Circle(radius=1.2, color=BLUE, fill_opacity=0.4)
        b = Circle(radius=1.2, color=GREEN, fill_opacity=0.4) if p["to_shape"] == "circle" else Square(side_length=2, color=GREEN, fill_opacity=0.4)
        drop_content(a)
        self.play(Write(title), FadeIn(a))
        self.play(Transform(a, b))
        self.wait(1)
