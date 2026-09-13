import importlib.util
import os
_spec = importlib.util.spec_from_file_location('templates._path', os.path.join(os.path.dirname(__file__), '_path.py'))
_path_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_path_mod)

from manim import *
from templates._no_tex import apply_no_tex
apply_no_tex()

from templates._text import mk_text
from templates._params import get_params
from templates._layout import mk_title
from templates._theme import apply_scene_theme


class ManimProbabilityTree(Scene):
    def construct(self):
        theme = apply_scene_theme(self)
        p = get_params({
            "title": "概率树",
            "branches": [
                {"path": "选中汽车 → 不换赢", "prob": "1/3"},
                {"path": "选中山羊 → 换门赢", "prob": "2/3"},
            ],
            "highlight": "2/3 换门胜率",
        })
        title = mk_title(p.get("title", "概率树"))
        branches = p.get("branches") or []
        highlight = str(p.get("highlight", ""))

        root = mk_text("开始", font_size=28, color=theme.accent)
        root.shift(UP * 2.5)

        nodes = VGroup(root)
        edges = VGroup()

        for i, b in enumerate(branches):
            path = str(b.get("path", f"分支{i+1}"))
            prob = str(b.get("prob", ""))
            is_hi = highlight and (highlight in path or highlight in prob)
            color = theme.primary if is_hi else theme.text

            y = 0.8 - i * 1.4
            node = VGroup(
                mk_text(path, font_size=22, color=color),
                mk_text(prob, font_size=26, color=theme.accent if is_hi else theme.muted),
            ).arrange(DOWN, buff=0.15)
            node.shift(DOWN * (i * 1.2) + LEFT * 0.5)

            edge = Line(root.get_bottom(), node.get_top(), color=theme.muted)
            edges.add(edge)
            nodes.add(node)

        if highlight:
            hi = mk_text(f"★ {highlight}", font_size=24, color=theme.primary)
            hi.to_edge(DOWN, buff=0.6)
            nodes.add(hi)

        self.play(Write(title), FadeIn(root))
        for e, n in zip(edges, nodes[1:len(branches)+1]):
            self.play(Create(e), FadeIn(n, shift=RIGHT * 0.2))
        if len(nodes) > len(branches) + 1:
            self.play(FadeIn(nodes[-1]))
        self.wait(1)
