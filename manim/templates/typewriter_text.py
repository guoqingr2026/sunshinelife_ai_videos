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


def _parse_highlights(p: dict) -> list[str]:
    raw = p.get("highlight")
    if raw is None:
        raw = p.get("highlights")
    if not raw:
        return []
    if isinstance(raw, str):
        raw = [raw]
    return [str(h).strip() for h in raw if str(h).strip()]


def _segment_by_highlights(text: str, terms: list[str]) -> list[tuple[str, bool]]:
    if not terms:
        return [(text, False)]
    segments: list[tuple[str, bool]] = []
    pos = 0
    while pos < len(text):
        found = None
        for h in terms:
            i = text.find(h, pos)
            if i >= 0 and (found is None or i < found[0]):
                found = (i, h)
        if found is None:
            segments.append((text[pos:], False))
            break
        i, h = found
        if i > pos:
            segments.append((text[pos:i], False))
        segments.append((h, True))
        pos = i + len(h)
    return segments


class TypewriterText(Scene):
    def construct(self):
        theme = apply_scene_theme(self)
        p = get_params({"text": "Active Recall", "subtitle": "", "highlight": []})
        subtitle = str(p.get("subtitle") or "").strip()
        body_text = str(p.get("text") or "…").strip()
        highlights = _parse_highlights(p)

        header = None
        if subtitle:
            header = mk_title(subtitle, font_size=26)

        y_shift = DOWN * (0.35 if subtitle else 0)
        segments = _segment_by_highlights(body_text, highlights)
        parts = VGroup()
        part_flags: list[bool] = []
        for seg, is_hi in segments:
            if not seg:
                continue
            parts.add(
                mk_text(seg, font_size=36, color=theme.accent if is_hi else theme.text)
            )
            part_flags.append(is_hi)
        if len(parts) == 0:
            parts.add(mk_text(body_text, font_size=36, color=theme.text))
        parts.arrange(RIGHT, buff=0, aligned_edge=DOWN)
        parts.shift(y_shift)
        if parts.width > config.frame_width * 0.92:
            parts.scale_to_fit_width(config.frame_width * 0.92)

        if header:
            self.play(Write(header))
        self.play(
            LaggedStart(
                *[AddTextLetterByLetter(part, time_per_char=0.05) for part in parts],
                lag_ratio=0.12,
            )
        )

        hi_parts = [part for part, is_hi in zip(parts, part_flags) if is_hi]
        if hi_parts:
            self.play(*[Indicate(part, color=theme.accent, scale_factor=1.05) for part in hi_parts])

        missing = [h for h in highlights if h not in body_text]
        if missing:
            chips = VGroup()
            for h in missing[:8]:
                chip = mk_text(f"◆ {h}", font_size=22, color=theme.accent)
                chips.add(chip)
            chips.arrange(DOWN, aligned_edge=LEFT, buff=0.12)
            chips.next_to(parts, DOWN, buff=0.45)
            self.play(LaggedStart(*[FadeIn(c, shift=RIGHT * 0.15) for c in chips], lag_ratio=0.08))

        self.wait(1)
