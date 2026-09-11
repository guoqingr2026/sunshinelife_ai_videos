"""Manim CLI 按文件加载场景时，确保 templates 包可导入。"""
import os
import sys

_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_TPL = os.path.dirname(os.path.abspath(__file__))
for _p in (_ROOT, _TPL):
    if _p not in sys.path:
        sys.path.insert(0, _p)
