import importlib.util
import os
_spec = importlib.util.spec_from_file_location('templates._path', os.path.join(os.path.dirname(__file__), '_path.py'))
_path_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_path_mod)

from manim import *
from templates._no_tex import apply_no_tex
apply_no_tex()

from templates._params import get_params
from templates._layout import mk_title
from templates._media import resolve_media_path
from templates._text import mk_text


class VideoEmbed(Scene):
    def construct(self):
        p = get_params({"title": "Video Clip", "videoPath": "", "max_duration": 3})
        title = mk_title(p["title"])
        path = resolve_media_path(p.get("videoPath", ""))
        self.play(Write(title))
        if path and os.path.exists(path) and path.lower().endswith((".mp4", ".mov", ".webm")):
            clip = VideoMobject(path).scale_to_fit_height(4)
            self.play(FadeIn(clip))
            self.wait(min(float(p.get("max_duration", 3)), 5))
        else:
            placeholder = mk_text("Video not found — set videoPath", font_size=24, color=YELLOW)
            self.play(FadeIn(placeholder))
            self.wait(1)
