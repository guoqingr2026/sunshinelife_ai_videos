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
from templates._axes import make_axes
from templates._text import mk_text


class LineChartCompare(Scene):
    def construct(self):
        p = get_params({
            "title": "Compare",
            "series": [{"name": "A", "values": [1, 3, 2, 5, 4]}, {"name": "B", "values": [2, 2, 4, 3, 6]}],
        })
        title = mk_title(p["title"])
        series = p["series"]
        n = max(len(s["values"]) for s in series)
        ymax = max(max(s["values"]) for s in series) * 1.2
        axes = make_axes(x_range=[0, n - 1, 1], y_range=[0, ymax, ymax / 4], x_length=8, y_length=4)
        curves = VGroup()
        colors = [YELLOW, GREEN, RED, BLUE]
        legends = VGroup()
        for i, s in enumerate(series):
            pts = s["values"]
            curve = axes.plot_line_graph(list(range(len(pts))), pts, line_color=colors[i % len(colors)], add_vertex_dots=True)
            curves.add(curve)
            legends.add(mk_text(s.get("name", f"S{i}"), font_size=18, color=colors[i % len(colors)]))
        legends.arrange(DOWN, aligned_edge=LEFT).to_corner(UR)
        chart = VGroup(axes, curves, legends)
        drop_content(chart)
        self.play(Write(title), Create(axes))
        self.play(Create(curves), Write(legends))
        self.wait(1)
