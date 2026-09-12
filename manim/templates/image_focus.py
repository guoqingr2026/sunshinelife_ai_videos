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
from templates._media import resolve_media_path
from templates._text import mk_text


class ImageFocus(Scene):
    def construct(self):
        p = get_params({"title": "Image", "imagePath": "icon.svg", "caption": ""})
        title = mk_title(p["title"])
        path = resolve_media_path(p["imagePath"])
        if os.path.exists(path) and path.lower().endswith((".png", ".jpg", ".jpeg", ".gif", ".webp")):
            img = ImageMobject(path, height=4)
        elif os.path.exists(path) and path.lower().endswith(".svg"):
            try:
                img = SVGMobject(path).scale_to_fit_height(4)
            except Exception:
                img = mk_text(f"[svg: {os.path.basename(path)}]", font_size=24)
        else:
            img = mk_text(f"[image: {os.path.basename(path)}]", font_size=24)
        drop_content(img)
        self.play(Write(title), FadeIn(img, scale=0.8))
        self.play(img.animate.scale(1.05), run_time=0.6)
        self.play(img.animate.scale(1 / 1.05), run_time=0.4)
        if p.get("caption"):
            self.play(Write(mk_text(p["caption"], font_size=22).next_to(img, DOWN)))
        self.wait(1)
