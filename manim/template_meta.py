"""Per-template render settings."""

META = {
    "scene_3d_surface": {"renderer": "opengl", "xvfb": True},
    "scene_3d_orbit": {"renderer": "opengl", "xvfb": True},
    "manim_lorenz_attractor": {"renderer": "opengl", "xvfb": True},
    "manim_curve_3d": {"renderer": "opengl", "xvfb": True},
    "manim_parametric_surface": {"renderer": "opengl", "xvfb": True},
    "manim_rossler": {"renderer": "opengl", "xvfb": True},
    "mathtex_formula": {"renderer": "cairo", "needs_latex": True},
    "mathtex_derivation": {"renderer": "cairo", "needs_latex": True},
    "manim_moving_frame_box": {"renderer": "cairo", "needs_latex": True},
    "manim_brace_annotation": {"renderer": "cairo", "needs_latex": True},
    "manim_moving_angle": {"renderer": "cairo", "needs_latex": True},
    "manim_following_camera": {"renderer": "cairo", "xvfb": False},
    "manim_sin_cos_plot": {"renderer": "cairo"},
    "manim_vector_arrow": {"renderer": "cairo"},
    "manim_point_on_path": {"renderer": "cairo"},
    "manim_sine_unit_circle": {"renderer": "cairo", "needs_latex": True},
    "manim_boolean_ops": {"renderer": "cairo"},
    "manim_graph_area": {"renderer": "cairo"},
    "manim_heat_diagram": {"renderer": "cairo"},
    "video_embed": {"renderer": "cairo"},
    "image_focus": {"renderer": "cairo"},
    "svg_icon": {"renderer": "cairo"},
    "custom_python": {"renderer": "cairo", "xvfb": False},
}


def get_template_meta(template_id: str) -> dict:
    return META.get(template_id, {"renderer": "cairo", "xvfb": False, "needs_latex": False})
