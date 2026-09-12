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
from templates._axes import make_bar_chart


class BarChartScene(Scene):
    def construct(self):
        p = get_params({"title": "Bar Chart", "values": [3, 5, 2, 7, 4]})
        values = [float(v) for v in p["values"]]
        names = ["A", "B", "C", "D", "E"][: len(values)]
        ymax = max(max(values) * 1.25, 1.0)
        title = mk_title(p["title"])
        chart = make_bar_chart(
            values,
            names=names,
            y_max=ymax,
            colors=["#3b82f6", "#22c55e", "#eab308", "#ef4444", "#14b8a6"],
        )
        drop_content(chart)
        self.play(Write(title))
        self.play(LaggedStart(*[FadeIn(b) for b in chart], lag_ratio=0.1))
        self.wait(1)
