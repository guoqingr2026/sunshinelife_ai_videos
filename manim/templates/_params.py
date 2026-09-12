import json
import os

_LOCALE = None


def _load_locale():
    global _LOCALE
    if _LOCALE is not None:
        return _LOCALE
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    path = os.path.join(root, "locale", "zh.json")
    try:
        with open(path, encoding="utf-8") as f:
            _LOCALE = json.load(f)
    except (OSError, json.JSONDecodeError):
        _LOCALE = {}
    return _LOCALE


def get_params(fallback=None):
    """Merge: locale/zh.json < fallback < MANIM_PARAMS (API wins)."""
    fb = dict(fallback or {})
    tid = os.environ.get("MANIM_TEMPLATE_ID", "")
    locale = _load_locale().get(tid, {})
    merged = {**locale, **fb}
    raw = os.environ.get("MANIM_PARAMS", "{}")
    try:
        data = json.loads(raw)
        if isinstance(data, dict):
            return {**merged, **data}
    except json.JSONDecodeError:
        pass
    return merged
