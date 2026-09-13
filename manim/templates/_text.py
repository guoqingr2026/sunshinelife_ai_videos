import os
from manim import Text as ManimText, WHITE, BOLD

CJK_FONT_CANDIDATES = [
    "Noto Sans CJK SC",
    "Noto Sans SC",
    "WenQuanYi Micro Hei",
    "WenQuanYi Zen Hei",
    "Source Han Sans SC",
    "SimHei",
    "Microsoft YaHei",
]


def get_cjk_font() -> str | None:
    try:
        from templates._params import get_params

        params = get_params()
        for key in ("cjk_font", "manimCjkFont", "font", "fontFamily"):
            value = params.get(key)
            if value and str(value).strip():
                return str(value).strip()
    except Exception:
        pass
    custom = os.environ.get("MANIM_CJK_FONT", "").strip()
    if custom:
        return custom
    return CJK_FONT_CANDIDATES[0]


def mk_text(content, font_size=36, color=WHITE, weight=BOLD, **kwargs):
    """CJK-capable Text (requires fonts-noto-cjk on ECS). Default weight=BOLD."""
    text = str(content)
    font = kwargs.pop("font", None) or get_cjk_font()
    w = kwargs.pop("weight", weight)
    if font:
        try:
            return ManimText(text, font=font, font_size=font_size, color=color, weight=w, **kwargs)
        except Exception:
            pass
    try:
        return ManimText(text, font_size=font_size, color=color, weight=w, **kwargs)
    except Exception:
        return ManimText(text, font_size=font_size, color=color, **kwargs)
