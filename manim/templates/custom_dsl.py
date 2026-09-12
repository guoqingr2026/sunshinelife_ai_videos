import importlib.util
import os
_spec = importlib.util.spec_from_file_location('templates._path', os.path.join(os.path.dirname(__file__), '_path.py'))
_path_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_path_mod)

from manim import *
from templates._no_tex import apply_no_tex
apply_no_tex()

from templates._params import get_params
from templates._layout import mk_title, drop_content
import numpy as np
from templates._text import mk_text

COLOR_MAP = {
    "BLUE": BLUE, "RED": RED, "GREEN": GREEN, "YELLOW": YELLOW,
    "WHITE": WHITE, "ORANGE": ORANGE, "PURPLE": PURPLE, "TEAL": TEAL,
}


class CustomDSLScene(Scene):
    def construct(self):
        p = get_params({
            "title": "DSL Demo",
            "objects": [
                {"id": "c1", "type": "circle", "radius": 1, "color": "BLUE"},
                {"id": "t1", "type": "text", "content": "Hello", "shift": [0, -2, 0]},
            ],
            "timeline": [{"action": "create", "target": "c1"}, {"action": "write", "target": "t1"}],
        })
        if p.get("title"):
            title = mk_title(p["title"])
            self.play(Write(title))
        registry = {}
        body = VGroup()
        for obj in p.get("objects", []):
            oid = obj["id"]
            kind = obj.get("type", "circle")
            color = COLOR_MAP.get(str(obj.get("color", "WHITE")).upper(), WHITE)
            m = None
            if kind == "circle":
                m = Circle(radius=float(obj.get("radius", 1)), color=color, fill_opacity=0.4)
            elif kind == "rect":
                m = Rectangle(width=float(obj.get("width", 2)), height=float(obj.get("height", 1)), color=color, fill_opacity=0.3)
            elif kind == "dot":
                m = Dot(color=color, radius=float(obj.get("radius", 0.08)))
            elif kind == "text":
                m = mk_text(str(obj.get("content", "")), font_size=int(obj.get("font_size", 28)), color=color)
            elif kind == "arrow":
                start = obj.get("start", [-1, 0, 0])
                end = obj.get("end", [1, 0, 0])
                m = Arrow(start, end, buff=0, color=color)
            if m is None:
                continue
            shift = obj.get("shift")
            if shift:
                m.shift(np.array(shift))
            registry[oid] = m
            body.add(m)
        if len(body) > 0:
            drop_content(body)
        for step in p.get("timeline", []):
            action = step.get("action", "fade_in")
            target = registry.get(step.get("target", ""))
            if target is None:
                continue
            if action == "wait":
                self.wait(float(step.get("duration", 1)))
            elif action == "create":
                self.play(Create(target))
            elif action == "fade_in":
                self.play(FadeIn(target))
            elif action == "write":
                self.play(Write(target))
            elif action == "grow_arrow":
                self.play(GrowArrow(target))
            elif action == "transform" and step.get("into") in registry:
                self.play(Transform(target, registry[step["into"]]))
        self.wait(0.5)
