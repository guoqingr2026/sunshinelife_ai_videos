import json
import re
import sys
import os
import shutil
import subprocess
import glob

from template_catalog import TEMPLATES
from template_meta import get_template_meta

CUSTOM_PYTHON_BOOTSTRAP = """
import importlib.util
import os
import numpy as np
_spec = importlib.util.spec_from_file_location(
    'templates._path',
    os.path.join(os.path.dirname(__file__), '..', 'templates', '_path.py'),
)
_path_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_path_mod)
from manim import *
from manim.utils.rate_functions import linear
from templates._no_tex import apply_no_tex
apply_no_tex()
from templates._text import mk_text
from templates._layout import mk_title, drop_content
from templates._params import get_params
from templates._theme import apply_scene_theme, theme_colors
from templates._axes import make_axes, make_number_plane, make_bar_chart
"""

_OPENGL_SCENE_BASES = frozenset({"ThreeDScene", "OpenGLScene", "ThreeD"})


def _strip_redundant_user_imports(code: str) -> str:
    lines = []
    for line in code.splitlines():
        s = line.strip()
        if s in ("from manim import *", "import numpy as np", "import numpy"):
            continue
        if s.startswith("from manim import ") or s.startswith("from manim."):
            continue
        lines.append(line)
    return "\n".join(lines).strip()


def analyze_custom_python(code: str, params: dict) -> tuple[str, bool]:
    """Return (class_name, needs_opengl)."""
    raw = str(code or "")
    class_name = str(params.get("class_name") or "").strip()
    base_class = ""

    if class_name:
        m = re.search(
            rf"class\s+{re.escape(class_name)}\s*\(\s*(\w+)\s*\)",
            raw,
        )
        if m:
            base_class = m.group(1)
    else:
        m = re.search(r"class\s+(\w+)\s*\(\s*(\w+)\s*\)", raw)
        if m:
            class_name = m.group(1)
            base_class = m.group(2)
        else:
            class_name = "CustomScene"

    renderer_hint = str(params.get("renderer") or "").strip().lower()
    if renderer_hint == "opengl":
        needs_opengl = True
    elif renderer_hint == "cairo":
        needs_opengl = False
    else:
        needs_opengl = base_class in _OPENGL_SCENE_BASES or bool(
            re.search(r"\bThreeDScene\b|\bOpenGLScene\b", raw)
        )
    return class_name, needs_opengl


def prepare_custom_python(params, task_id, root):
    code = params.get("code", "")
    if not str(code).strip():
        raise ValueError("custom_python requires params.code")
    class_name, needs_opengl = analyze_custom_python(str(code), params if isinstance(params, dict) else {})
    body = _strip_redundant_user_imports(str(code))
    custom_dir = os.path.join(root, "custom_scenes")
    os.makedirs(custom_dir, exist_ok=True)
    script_path = os.path.join(custom_dir, f"{task_id}.py")
    with open(script_path, "w", encoding="utf-8") as f:
        f.write(CUSTOM_PYTHON_BOOTSTRAP.strip() + "\n\n" + body + "\n")
    return f"custom_scenes/{task_id}.py", class_name, needs_opengl


def find_manim_cmd():
    """优先用当前 Python 的 -m manim，确保 PYTHONPATH 与子进程一致。"""
    import shutil as sh
    try:
        r = subprocess.run(
            [sys.executable, "-m", "manim", "--version"],
            capture_output=True,
            text=True,
        )
        if r.returncode == 0:
            return [sys.executable, "-m", "manim"]
    except OSError:
        pass
    if sh.which("manim"):
        return ["manim"]
    return [sys.executable, "-m", "manim"]


def build_commands(base_cmd, script_file, class_name, out_name, renderer="cairo", quality="-ql"):
    """兼容 Manim 0.18 / 0.19；3D 场景用 opengl + xvfb。quality: -qh/-qm/-ql"""
    q = quality if quality in ("-qh", "-qm", "-ql") else "-ql"
    common = [q, "--renderer", renderer, "--format", "mp4", "-o", out_name]
    scene = [script_file, class_name]
    return [
        [*base_cmd, "render", *common, *scene],
        [*base_cmd, *common, *scene],
        [*base_cmd, q, "--format", "mp4", "-o", out_name, *scene],
    ]


def wrap_xvfb(cmd, use_xvfb):
    if use_xvfb and shutil.which("xvfb-run"):
        return ["xvfb-run", "-a", *cmd]
    return cmd


def load_payload():
    if len(sys.argv) > 1 and sys.argv[1] == "--stdin":
        return json.loads(sys.stdin.read())
    if len(sys.argv) > 1:
        return json.loads(sys.argv[1])
    return json.loads(sys.stdin.read())


def main():
    payload = load_payload()
    task_type = payload.get("type", "pn_junction")
    output_path = payload.get("outputPath", "output.mp4")
    params = payload.get("params", {})

    task_id = payload.get("taskId", "custom")
    root = os.path.dirname(os.path.abspath(__file__))

    custom_renderer = None
    custom_xvfb = None

    if task_type == "custom_python":
        try:
            script_file, class_name, custom_opengl = prepare_custom_python(
                params, task_id, root
            )
            custom_renderer = "opengl" if custom_opengl else "cairo"
            custom_xvfb = custom_opengl
        except ValueError as e:
            sys.stderr.write(str(e) + "\n")
            sys.exit(1)
    elif task_type == "formula_curve":
        mode = str(params.get("mode", "parametric_2d"))
        script_file = "templates/formula_curve.py"
        class_name = (
            "FormulaCurve3DScene" if mode == "parametric_3d" else "FormulaCurveScene"
        )
        custom_renderer = "opengl" if mode == "parametric_3d" else "cairo"
        custom_xvfb = mode == "parametric_3d"
    elif task_type == "manim_custom":
        from templates.math_universe.registry import resolve_universe_scene, scene_needs_opengl
        from templates._params import get_params

        # Merge locale defaults (zh.json) before resolving scene class
        os.environ["MANIM_TEMPLATE_ID"] = task_type
        os.environ["MANIM_PARAMS"] = json.dumps(params if isinstance(params, dict) else {})
        merged = get_params(params if isinstance(params, dict) else {})
        scene_name = str(merged.get("scene") or merged.get("class_name") or "").strip()
        params = merged
        resolved = resolve_universe_scene(scene_name)
        if not resolved:
            sys.stderr.write(f"Unknown manim_custom scene: {scene_name}\n")
            sys.stderr.write(
                "Valid scene names: CardioidScene, LorenzScene, MandelbrotScene, ... "
                "(see GET /api/manim/universe-scenes)\n"
            )
            sys.exit(1)
        script_file, class_name = resolved
        if class_name == "FormulaCurveScene" and str(merged.get("mode")) == "parametric_3d":
            script_file = "templates/formula_curve.py"
            class_name = "FormulaCurve3DScene"
        custom_renderer = "opengl" if scene_needs_opengl(scene_name) or class_name == "FormulaCurve3DScene" else "cairo"
        custom_xvfb = custom_renderer == "opengl"
    elif task_type not in TEMPLATES:
        sys.stderr.write(f"Unknown manim template: {task_type}\n")
        sys.stderr.write(
            f"Valid types: {', '.join(sorted(TEMPLATES.keys()))}, custom_python, formula_curve, manim_custom\n"
        )
        sys.exit(1)
    else:
        scene_class = TEMPLATES[task_type]
        module_path, class_name = scene_class.rsplit(".", 1)
        script_file = f"{module_path.replace('.', '/')}.py"

    meta = get_template_meta(task_type)
    renderer = custom_renderer if custom_renderer else meta.get("renderer", "cairo")
    use_xvfb = custom_xvfb if custom_xvfb is not None else meta.get("xvfb", False)

    storage_root = payload.get("storageRoot", "")
    if storage_root:
        os.environ["MANIM_STORAGE_ROOT"] = storage_root

    os.environ["MANIM_TEMPLATE_ID"] = task_type
    os.environ["MANIM_PARAMS"] = json.dumps(params)
    os.environ["MANIM_OUTPUT"] = output_path
    os.environ["MANIM_RENDERER"] = renderer
    cjk_from_params = (
        params.get("cjk_font")
        or params.get("manimCjkFont")
        or params.get("font")
        or payload.get("manimCjkFont")
    )
    if cjk_from_params:
        os.environ["MANIM_CJK_FONT"] = str(cjk_from_params)
    else:
        os.environ.setdefault("MANIM_CJK_FONT", "Noto Sans CJK SC")

    output_dir = os.path.dirname(output_path)
    os.makedirs(output_dir, exist_ok=True)

    media_dir = os.path.join(root, "media")
    if os.path.exists(media_dir):
        shutil.rmtree(media_dir, ignore_errors=True)

    out_name = os.path.splitext(os.path.basename(output_path))[0]

    env = os.environ.copy()
    env["MANIM_RENDERER"] = renderer
    py_path = env.get("PYTHONPATH", "")
    env["PYTHONPATH"] = root + (os.pathsep + py_path if py_path else "")

    base = find_manim_cmd()
    quality = str(payload.get("quality") or params.get("quality") or "-ql").strip()
    if quality not in ("-qh", "-qm", "-ql"):
        quality = "-ql"
    last_result = None
    for cmd in build_commands(base, script_file, class_name, out_name, renderer, quality):
        cmd = wrap_xvfb(cmd, use_xvfb)
        last_result = subprocess.run(
            cmd,
            cwd=root,
            capture_output=True,
            text=True,
            env=env,
        )
        if last_result.returncode == 0:
            break

    if not last_result or last_result.returncode != 0:
        sys.stderr.write(
            f"CMD: {' '.join(build_commands(base, script_file, class_name, out_name, renderer, quality)[0])}\n"
        )
        sys.stderr.write(f"PYTHONPATH={env.get('PYTHONPATH', '')}\n")
        sys.stderr.write(f"MANIM_ROOT={root}\n")
        sys.stderr.write(last_result.stderr if last_result else "no result\n")
        sys.stderr.write(last_result.stdout if last_result else "")
        sys.exit(last_result.returncode if last_result else 1)

    media_videos = os.path.join(root, "media", "videos")
    mp4_files = glob.glob(os.path.join(media_videos, "**", "*.mp4"), recursive=True)
    if not mp4_files:
        sys.stderr.write("No mp4 found under media/videos\n")
        sys.stderr.write(last_result.stderr or "")
        sys.exit(1)

    newest = max(mp4_files, key=os.path.getmtime)
    shutil.copy2(newest, output_path)

    if os.path.getsize(output_path) < 2048:
        sys.stderr.write(f"Output too small: {output_path}\n")
        sys.exit(1)

    sys.exit(0)


if __name__ == "__main__":
    main()
