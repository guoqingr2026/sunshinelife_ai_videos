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
    """Merge params so user/API content always wins over demos.

    Priority (low → high):
      1. code ``fallback`` (template hard-coded demos)
      2. ``locale/zh.json`` defaults for this template id
      3. ``MANIM_PARAMS`` from API / 一键成片 shots[].params  (**highest**)

    Previously fallback overwrote locale, so English demo strings (and demo
    LaTeX ``parts``) stuck even when zh.json or the user supplied content.
    """
    fb = dict(fallback or {})
    tid = os.environ.get("MANIM_TEMPLATE_ID", "")
    locale = _load_locale().get(tid, {})
    if not isinstance(locale, dict):
        locale = {}
    merged = {**fb, **locale}
    raw = os.environ.get("MANIM_PARAMS", "{}")
    try:
        data = json.loads(raw)
        if isinstance(data, dict):
            # API keys always win, including empty string / empty list clears
            return {**merged, **data}
    except json.JSONDecodeError:
        pass
    return merged
