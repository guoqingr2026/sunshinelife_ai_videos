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
