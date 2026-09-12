import importlib.util
import os
_spec = importlib.util.spec_from_file_location('templates._path', os.path.join(os.path.dirname(__file__), '_path.py'))
_path_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_path_mod)

from manim import *
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
            bar_names=names,
            y_range=[0, ymax, ymax / 4],
            y_length=4,
            x_length=8,
            bar_colors=[BLUE, GREEN, YELLOW, RED, TEAL],
        )
        drop_content(chart)
        self.play(Write(title))
        self.play(Create(chart))
        self.wait(1)
