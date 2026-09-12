import os
from manim import Text as ManimText, WHITE

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
    custom = os.environ.get("MANIM_CJK_FONT", "").strip()
    if custom:
        return custom
    return CJK_FONT_CANDIDATES[0]


def mk_text(content, font_size=36, color=WHITE, **kwargs):
    """CJK-capable Text (requires fonts-noto-cjk on ECS)."""
    text = str(content)
    font = get_cjk_font()
    if font:
        try:
            return ManimText(text, font=font, font_size=font_size, color=color, **kwargs)
        except Exception:
            pass
    return ManimText(text, font_size=font_size, color=color, **kwargs)
