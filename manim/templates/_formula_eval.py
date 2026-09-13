"""Safe numeric expression evaluation for formula-driven curves."""
from __future__ import annotations

import numpy as np

_SAFE_ENV = {
    "sin": np.sin,
    "cos": np.cos,
    "tan": np.tan,
    "asin": np.arcsin,
    "acos": np.arccos,
    "atan": np.arctan,
    "sinh": np.sinh,
    "cosh": np.cosh,
    "tanh": np.tanh,
    "exp": np.exp,
    "log": np.log,
    "log10": np.log10,
    "sqrt": np.sqrt,
    "abs": np.abs,
    "pow": pow,
    "pi": np.pi,
    "tau": 2 * np.pi,
    "min": min,
    "max": max,
}


def _validate_expr(expr: str) -> str:
    s = str(expr or "0").strip()
    if not s:
        return "0"
    allowed = set("0123456789+-*/().,_ tabcdefghijklmnopqrstuvwxyz")
    for ch in s.lower():
        if ch not in allowed and not ch.isspace():
            raise ValueError(f"表达式含非法字符: {ch!r}（仅支持 t 与数学函数）")
    return s


def eval_curve_expr(expr: str, t: float) -> float:
    """Evaluate expression in variable t using whitelisted math helpers."""
    code = _validate_expr(expr)
    env = dict(_SAFE_ENV)
    env["t"] = float(t)
    return float(eval(code, {"__builtins__": {}}, env))
