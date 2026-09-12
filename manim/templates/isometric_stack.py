import importlib.util
import os
_spec = importlib.util.spec_from_file_location('templates._path', os.path.join(os.path.dirname(__file__), '_path.py'))
_path_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_path_mod)

from manim import *
from templates._params import get_params
from templates._layout import mk_title, drop_content


class IsometricStack(Scene):
    def construct(self):
        p = get_params({"title": "Layer Stack"})
        title = mk_title(p["title"], font_size=28)
        layers = VGroup()
        colors = [BLUE, GREEN, YELLOW, RED]
        for i, c in enumerate(colors):
            w, h = 3 - i * 0.2, 0.5
            rect = Polygon(
                [-w / 2, -h / 2 + i * 0.35, 0],
                [w / 2, -h / 2 + i * 0.35, 0],
                [w / 2 + 0.4, h / 2 + i * 0.35, 0],
                [-w / 2 + 0.4, h / 2 + i * 0.35, 0],
                color=c,
                fill_opacity=0.5,
            )
            layers.add(rect)
        drop_content(layers)
        self.play(Write(title))
        self.play(LaggedStart(*[FadeIn(l, shift=UP * 0.2) for l in layers], lag_ratio=0.25))
        self.wait(1)
