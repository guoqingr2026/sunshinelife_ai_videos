"""Math universe scene registry for manim_custom dispatch."""

from __future__ import annotations

SCENE_REGISTRY: dict[str, str] = {
    "ParametricCurveScene": "templates.math_universe.curve_2d.ParametricCurveScene",
    "RoseCurveScene": "templates.math_universe.curve_2d.RoseCurveScene",
    "CardioidScene": "templates.math_universe.curve_2d.CardioidScene",
    "ArchimedeanSpiralScene": "templates.math_universe.curve_2d.ArchimedeanSpiralScene",
    "EpicycloidScene": "templates.math_universe.curve_2d.EpicycloidScene",
    "LissajousScene": "templates.math_universe.curve_2d.LissajousScene",
    "SpirographScene": "templates.math_universe.curve_2d.SpirographScene",
    "HarmonicCurveScene": "templates.math_universe.curve_2d.HarmonicCurveScene",
    "IteratedFlowerScene": "templates.math_universe.curve_2d.IteratedFlowerScene",
    "ComplexCurveScene": "templates.math_universe.curve_2d.ComplexCurveScene",
    "FormulaCurveScene": "templates.formula_curve.FormulaCurveScene",
    "FormulaCurve3DScene": "templates.formula_curve.FormulaCurve3DScene",
    "Curve3DScene": "templates.math_universe.curve_3d.Curve3DScene",
    "Lissajous3DScene": "templates.math_universe.curve_3d.Lissajous3DScene",
    "Harmonic3DScene": "templates.math_universe.curve_3d.Harmonic3DScene",
    "HarmonicRibbon3D": "templates.math_universe.curve_3d.HarmonicRibbon3D",
    "SpiralFlower3D": "templates.math_universe.curve_3d.SpiralFlower3D",
    "SurfaceScene": "templates.math_universe.surfaces.SurfaceScene",
    "SaddleSurfaceScene": "templates.math_universe.surfaces.SaddleSurfaceScene",
    "LorenzScene": "templates.math_universe.chaos.LorenzScene",
    "ColorLorenz3D": "templates.math_universe.chaos.ColorLorenz3D",
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
    "spirograph": "SpirographScene",
    "harmonic_curve": "HarmonicCurveScene",
    "harmonic_2d": "HarmonicCurveScene",
    "iterated_flower": "IteratedFlowerScene",
    "complex_curve": "ComplexCurveScene",
    "formula_curve": "FormulaCurveScene",
    "formula_curve_3d": "FormulaCurve3DScene",
    "curve_3d": "Curve3DScene",
    "lissajous_3d": "Lissajous3DScene",
    "harmonic_3d": "Harmonic3DScene",
    "harmonic_ribbon_3d": "HarmonicRibbon3D",
    "spiral_flower_3d": "SpiralFlower3D",
    "surface": "SurfaceScene",
    "saddle_surface": "SaddleSurfaceScene",
    "lorenz": "LorenzScene",
    "lorenz_attractor": "LorenzScene",
    "color_lorenz_3d": "ColorLorenz3D",
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
        "Harmonic3DScene",
        "HarmonicRibbon3D",
        "SpiralFlower3D",
        "FormulaCurve3DScene",
        "SurfaceScene",
        "SaddleSurfaceScene",
        "LorenzScene",
        "ColorLorenz3D",
        "RosslerScene",
        "ManimLorenzAttractor",
        "lorenz",
        "lorenz_attractor",
        "color_lorenz_3d",
        "rossler",
        "harmonic_3d",
        "harmonic_ribbon_3d",
        "spiral_flower_3d",
        "formula_curve_3d",
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
