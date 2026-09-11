import json
import os


def get_params(default=None):
    raw = os.environ.get("MANIM_PARAMS", "{}")
    try:
        data = json.loads(raw)
        if isinstance(data, dict):
            return {**(default or {}), **data}
    except json.JSONDecodeError:
        pass
    return default or {}
