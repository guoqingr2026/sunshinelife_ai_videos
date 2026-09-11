from manim import *
from templates._text import mk_text
from templates._params import get_params


class BarChartScene(Scene):
    def construct(self):
        p = get_params({"title": "数据统计", "values": [3, 5, 2, 7, 4]})
        values = p["values"]
        chart = BarChart(values, bar_names=["A", "B", "C", "D", "E"], y_range=[0, 8, 2], y_length=4, x_length=8)
        title = mk_text(p["title"], font_size=32).to_edge(UP)
        self.play(Write(title))
        self.play(Create(chart))
        self.wait(1)
