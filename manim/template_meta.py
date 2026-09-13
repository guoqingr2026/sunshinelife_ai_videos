"""Per-template render settings."""

META = {
    "scene_3d_surface": {"renderer": "opengl", "xvfb": True},
    "scene_3d_orbit": {"renderer": "opengl", "xvfb": True},
    "manim_lorenz_attractor": {"renderer": "opengl", "xvfb": True},
    "mathtex_formula": {"renderer": "cairo", "needs_latex": True},
    "mathtex_derivation": {"renderer": "cairo", "needs_latex": True},
    "video_embed": {"renderer": "cairo"},
    "image_focus": {"renderer": "cairo"},
    "svg_icon": {"renderer": "cairo"},
}


def get_template_meta(template_id: str) -> dict:
    return META.get(template_id, {"renderer": "cairo", "xvfb": False, "needs_latex": False})
