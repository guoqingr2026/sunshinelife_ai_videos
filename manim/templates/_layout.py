"""Layout helpers to avoid title/content overlap."""
from manim import DOWN, UP
from templates._text import mk_text

TITLE_BUFF = 0.55
CONTENT_DROP = 0.45


def mk_title(text, font_size=32, buff=TITLE_BUFF):
    return mk_text(str(text), font_size=font_size).to_edge(UP, buff=buff)


def drop_content(mobject, amount=CONTENT_DROP):
    mobject.shift(DOWN * amount)
    return mobject
