import shutil
from manim import WHITE
from templates._text import mk_text


def latex_available() -> bool:
    return shutil.which("latex") is not None


def mk_mathtex(tex: str, font_size=36, color=WHITE, **kwargs):
    """MathTex when texlive exists, else plain text fallback."""
    content = str(tex)
    if latex_available():
        try:
            from manim import MathTex
            return MathTex(content, font_size=font_size, color=color, **kwargs)
        except Exception:
            pass
    plain = content.replace("\\", "").replace("{", "").replace("}", "").replace("^", "")
    return mk_text(plain, font_size=font_size, color=color, **kwargs)


def mk_mathtex_parts(parts: list, font_size=40, color=WHITE, **kwargs):
    """Multi-part MathTex (indexable submobjects) or horizontal text fallback."""
    strings = [str(p) for p in parts]
    if latex_available():
        try:
            from manim import MathTex
            return MathTex(*strings, font_size=font_size, color=color, **kwargs)
        except Exception:
            pass
    from manim import VGroup

    chunks = []
    for s in strings:
        plain = (
            s.replace(r"\frac{d}{dx}", "d/dx")
            .replace("\\", "")
            .replace("{", "")
            .replace("}", "")
            .replace("^", "")
        )
        chunks.append(mk_text(plain, font_size=max(20, font_size - 12), color=color))
    group = VGroup(*chunks)
    group.arrange(RIGHT, buff=0.08)
    return group
