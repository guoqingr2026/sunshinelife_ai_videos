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


class TypewriterText(Scene):
    def construct(self):
        theme = apply_scene_theme(self)
        p = get_params({"text": "Active Recall", "subtitle": "", "highlight": []})
        subtitle = str(p.get("subtitle") or "").strip()
        body_text = str(p.get("text") or "…").strip()
        highlights = p.get("highlight") or []
        if isinstance(highlights, str):
            highlights = [highlights]
        highlights = [str(h).strip() for h in highlights if str(h).strip()]

        header = None
        if subtitle:
            header = mk_title(subtitle, font_size=26)
        body = mk_text(body_text, font_size=36, color=theme.text).shift(
            DOWN * (0.35 if subtitle else 0)
        )

        if header:
            self.play(Write(header))
        self.play(AddTextLetterByLetter(body, time_per_char=0.05))

        if highlights:
            chips = VGroup()
            for h in highlights[:8]:
                chip = mk_text(f"◆ {h}", font_size=22, color=theme.accent)
                chips.add(chip)
            chips.arrange(DOWN, aligned_edge=LEFT, buff=0.12)
            chips.next_to(body, DOWN, buff=0.45)
            self.play(LaggedStart(*[FadeIn(c, shift=RIGHT * 0.15) for c in chips], lag_ratio=0.08))

        self.wait(1)
