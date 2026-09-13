"""Math universe scene registry for manim_custom dispatch."""

from __future__ import annotations

SCENE_REGISTRY: dict[str, str] = {
    "ParametricCurveScene": "templates.math_universe.curve_2d.ParametricCurveScene",
    "RoseCurveScene": "templates.math_universe.curve_2d.RoseCurveScene",
    "CardioidScene": "templates.math_universe.curve_2d.CardioidScene",
    "ArchimedeanSpiralScene": "templates.math_universe.curve_2d.ArchimedeanSpiralScene",
    "EpicycloidScene": "templates.math_universe.curve_2d.EpicycloidScene",
    "LissajousScene": "templates.math_universe.curve_2d.LissajousScene",
    "Curve3DScene": "templates.math_universe.curve_3d.Curve3DScene",
    "Lissajous3DScene": "templates.math_universe.curve_3d.Lissajous3DScene",
    "SurfaceScene": "templates.math_universe.surfaces.SurfaceScene",
    "SaddleSurfaceScene": "templates.math_universe.surfaces.SaddleSurfaceScene",
    "LorenzScene": "templates.math_universe.chaos.LorenzScene",
    "RosslerScene": "templates.math_universe.chaos.RosslerScene",
    "MandelbrotScene": "templates.math_universe.fractals.MandelbrotScene",
    "JuliaScene": "templates.math_universe.fractals.JuliaScene",
    "KochSnowflakeScene": "templates.math_universe.fractals.KochSnowflakeScene",
    "ThreeBodyScene": "templates.math_universe.dynamics.ThreeBodyScene",
    "ManimCardioid": "templates.math_curves.ManimCardioid",
    "ManimRoseCurve": "templates.math_curves.ManimRoseCurve",
    "ManimArchimedeanSpiral": "templates.math_curves.ManimArchimedeanSpiral",
    "ManimExponentialSpiral": "templates.math_curves.ManimExponentialSpiral",
    "ManimLemniscate": "templates.math_curves.ManimLemniscate",
    "ManimCycloid": "templates.math_curves.ManimCycloid",
    "ManimLissajous": "templates.math_curves.ManimLissajous",
    "ManimLorenzAttractor": "templates.math_curves.ManimLorenzAttractor",
    "ManimMandelbrotZoom": "templates.math_curves.ManimMandelbrotZoom",
}

SCENE_ALIASES: dict[str, str] = {
    "parametric_curve": "ParametricCurveScene",
    "rose_curve": "RoseCurveScene",
    "cardioid": "CardioidScene",
    "archimedean_spiral": "ArchimedeanSpiralScene",
    "epicycloid": "EpicycloidScene",
    "lissajous": "LissajousScene",
    "curve_3d": "Curve3DScene",
    "lissajous_3d": "Lissajous3DScene",
    "surface": "SurfaceScene",
    "saddle_surface": "SaddleSurfaceScene",
    "lorenz": "LorenzScene",
    "lorenz_attractor": "LorenzScene",
    "rossler": "RosslerScene",
    "mandelbrot": "MandelbrotScene",
    "julia": "JuliaScene",
    "julia_set": "JuliaScene",
    "koch": "KochSnowflakeScene",
    "koch_snowflake": "KochSnowflakeScene",
    "three_body": "ThreeBodyScene",
    "manim_cardioid": "ManimCardioid",
    "manim_rose_curve": "ManimRoseCurve",
    "manim_archimedean_spiral": "ManimArchimedeanSpiral",
    "manim_exponential_spiral": "ManimExponentialSpiral",
    "manim_lemniscate": "ManimLemniscate",
    "manim_cycloid": "ManimCycloid",
    "manim_lissajous": "ManimLissajous",
    "manim_lorenz_attractor": "ManimLorenzAttractor",
    "manim_mandelbrot_zoom": "ManimMandelbrotZoom",
}

OPENGL_SCENES = frozenset(
    {
        "Curve3DScene",
        "Lissajous3DScene",
        "SurfaceScene",
        "SaddleSurfaceScene",
        "LorenzScene",
        "RosslerScene",
        "ManimLorenzAttractor",
        "lorenz",
        "lorenz_attractor",
        "rossler",
        "manim_lorenz_attractor",
        "curve_3d",
        "manim_curve_3d",
        "manim_parametric_surface",
        "manim_rossler",
    }
)


def normalize_scene_name(name: str) -> str:
    key = str(name or "").strip()
    if not key:
        return ""
    if key in SCENE_REGISTRY:
        return key
    lower = key.lower().replace("-", "_")
    return SCENE_ALIASES.get(lower, key)


def resolve_universe_scene(name: str) -> tuple[str, str] | None:
    canonical = normalize_scene_name(name)
    entry = SCENE_REGISTRY.get(canonical)
    if not entry:
        return None
    module_path, class_name = entry.rsplit(".", 1)
    script_file = f"{module_path.replace('.', '/')}.py"
    return script_file, class_name


def list_universe_scenes() -> list[dict[str, str]]:
    items = []
    for scene_id, path in sorted(SCENE_REGISTRY.items()):
        category = path.split(".")[2] if len(path.split(".")) > 2 else "misc"
        items.append({"id": scene_id, "module": path, "category": category})
    return items


def scene_needs_opengl(name: str) -> bool:
    canonical = normalize_scene_name(name)
    raw = str(name or "").strip().lower().replace("-", "_")
    return canonical in OPENGL_SCENES or raw in OPENGL_SCENES
