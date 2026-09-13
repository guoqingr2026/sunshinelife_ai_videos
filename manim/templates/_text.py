import os
import platform
import subprocess
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

# Linux ECS 无 Windows 字体时自动映射（需 install-fonts.sh 安装文鼎楷体）
LINUX_FONT_MAP = {
    "KaiTi": "AR PL UKai CN",
    "STKaiti": "AR PL UKai CN",
    "楷体": "AR PL UKai CN",
    "Microsoft YaHei": "Noto Sans SC",
    "PingFang SC": "Noto Sans SC",
    "Hiragino Sans GB": "Noto Sans SC",
}


def _font_available(name: str) -> bool:
    try:
        r = subprocess.run(
            ["fc-match", "-s", name],
            capture_output=True,
            text=True,
            timeout=3,
        )
        line = (r.stdout or "").strip().split("\n")[0]
        if not line or "DejaVu" in line and name.lower() not in line.lower():
            return False
        family = line.split(":")[0].strip().lower()
        return name.lower() in family or family in name.lower()
    except Exception:
        return True


def resolve_cjk_font(requested: str) -> str:
    name = str(requested).strip()
    if not name:
        return CJK_FONT_CANDIDATES[0]
    if platform.system() == "Linux":
        mapped = LINUX_FONT_MAP.get(name, name)
        if mapped != name and _font_available(mapped):
            return mapped
        if name in LINUX_FONT_MAP and _font_available(LINUX_FONT_MAP[name]):
            return LINUX_FONT_MAP[name]
    return name


def get_cjk_font() -> str | None:
    try:
        from templates._params import get_params

        params = get_params()
        for key in ("cjk_font", "manimCjkFont", "font", "fontFamily"):
            value = params.get(key)
            if value and str(value).strip():
                return resolve_cjk_font(str(value).strip())
    except Exception:
        pass
    custom = os.environ.get("MANIM_CJK_FONT", "").strip()
    if custom:
        return resolve_cjk_font(custom)
    return CJK_FONT_CANDIDATES[0]


def _default_text_color():
    try:
        from templates._theme import theme_colors

        return theme_colors().text
    except Exception:
        return WHITE


def mk_text(content, font_size=36, color=None, weight=BOLD, **kwargs):
    """CJK-capable Text (requires fonts-noto-cjk on ECS). Default weight=BOLD."""
    text = str(content)
    if color is None:
        color = _default_text_color()
    font = kwargs.pop("font", None) or get_cjk_font()
    w = kwargs.pop("weight", weight)
    candidates = [font] if font else []
    if font and platform.system() == "Linux":
        candidates.extend(CJK_FONT_CANDIDATES)
    for try_font in candidates:
        try:
            return ManimText(
                text,
                font=try_font,
                font_size=font_size,
                color=color,
                weight=w,
                **kwargs,
            )
        except Exception:
            continue
    try:
        return ManimText(text, font_size=font_size, color=color, weight=w, **kwargs)
    except Exception:
        return ManimText(text, font_size=font_size, color=color, **kwargs)
