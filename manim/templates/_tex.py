import re
import shutil
from manim import WHITE
from templates._text import mk_text


def latex_available() -> bool:
    return shutil.which("latex") is not None


def looks_like_latex(tex: str) -> bool:
    s = str(tex or "").strip()
    if not s:
        return False
    if "\\" in s:
        return True
    if re.search(r"[\^_]\{", s):
        return True
    if re.search(r"\\(frac|sum|int|sqrt|pi|alpha|beta|gamma|theta|infty|cdot|times|leq|geq)", s):
        return True
    return False


def _latex_to_plain(tex: str) -> str:
    s = str(tex)
    reps = [
        (r"\\pi", "π"),
        (r"\\infty", "∞"),
        (r"\\theta", "θ"),
        (r"\\alpha", "α"),
        (r"\\beta", "β"),
        (r"\\gamma", "γ"),
        (r"\\cdot", "·"),
        (r"\\times", "×"),
        (r"\\leq", "≤"),
        (r"\\geq", "≥"),
        (r"\\neq", "≠"),
        (r"\\frac\{([^{}]+)\}\{([^{}]+)\}", r"(\1)/(\2)"),
        (r"\\sqrt\{([^{}]+)\}", r"√(\1)"),
        (r"\\left", ""),
        (r"\\right", ""),
        (r"\\text\{([^{}]*)\}", r"\1"),
        (r"\{", ""),
        (r"\}", ""),
        (r"\\", ""),
        (r"\^", "^"),
        (r"_", ""),
    ]
    for pat, repl in reps:
        s = re.sub(pat, repl, s)
    return s.strip() or str(tex)


def mk_math_or_text(tex: str, font_size=36, color=WHITE, force_latex=False, **kwargs):
    """Render LaTeX when available / content looks mathematical; else plain CJK text."""
    if force_latex or looks_like_latex(tex):
        return mk_mathtex(tex, font_size=font_size, color=color, **kwargs)
    return mk_text(str(tex), font_size=font_size, color=color, **kwargs)


def mk_mathtex(tex: str, font_size=36, color=WHITE, **kwargs):
    """MathTex when texlive exists, else plain text fallback."""
    content = str(tex)
    if latex_available():
        try:
            from manim import MathTex
            return MathTex(content, font_size=font_size, color=color, **kwargs)
        except Exception:
            pass
    return mk_text(_latex_to_plain(content), font_size=font_size, color=color, **kwargs)


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
