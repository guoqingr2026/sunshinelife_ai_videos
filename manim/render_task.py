import json
import re
import sys
import os
import shutil
import subprocess
import glob

from template_catalog import TEMPLATES

CUSTOM_PYTHON_BOOTSTRAP = """
import importlib.util
import os
_spec = importlib.util.spec_from_file_location(
    'templates._path',
    os.path.join(os.path.dirname(__file__), '..', 'templates', '_path.py'),
)
_path_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_path_mod)
from manim import *
from templates._no_tex import apply_no_tex
apply_no_tex()
from templates._text import mk_text
from templates._layout import mk_title, drop_content
from templates._params import get_params
from templates._axes import make_axes, make_number_plane, make_bar_chart
"""


def prepare_custom_python(params, task_id, root):
    code = params.get("code", "")
    if not str(code).strip():
        raise ValueError("custom_python requires params.code")
    class_name = params.get("class_name") or ""
    if not class_name:
        m = re.search(r"class\s+(\w+)\s*\(\s*Scene", code)
        class_name = m.group(1) if m else "CustomScene"
    custom_dir = os.path.join(root, "custom_scenes")
    os.makedirs(custom_dir, exist_ok=True)
    script_path = os.path.join(custom_dir, f"{task_id}.py")
    with open(script_path, "w", encoding="utf-8") as f:
        f.write(CUSTOM_PYTHON_BOOTSTRAP.strip() + "\n\n" + code)
    return f"custom_scenes/{task_id}.py", class_name


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


def build_commands(base_cmd, script_file, class_name, out_name):
    """兼容 Manim 0.18 / 0.19 不同 CLI 写法"""
    common = ["-ql", "--renderer", "cairo", "--format", "mp4", "-o", out_name]
    scene = [script_file, class_name]
    return [
        [*base_cmd, "render", *common, *scene],
        [*base_cmd, *common, *scene],
        [*base_cmd, "-ql", "--format", "mp4", "-o", out_name, *scene],
    ]


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

    if task_type == "custom_python":
        try:
            script_file, class_name = prepare_custom_python(params, task_id, root)
        except ValueError as e:
            sys.stderr.write(str(e) + "\n")
            sys.exit(1)
    elif task_type not in TEMPLATES:
        sys.stderr.write(f"Unknown manim template: {task_type}\n")
        sys.stderr.write(f"Valid types: {', '.join(sorted(TEMPLATES.keys()))}, custom_python\n")
        sys.exit(1)
    else:
        scene_class = TEMPLATES[task_type]
        module_path, class_name = scene_class.rsplit(".", 1)
        script_file = f"{module_path.replace('.', '/')}.py"

    os.environ["MANIM_TEMPLATE_ID"] = task_type
    os.environ["MANIM_PARAMS"] = json.dumps(params)
    os.environ["MANIM_OUTPUT"] = output_path
    os.environ["MANIM_RENDERER"] = "cairo"
    os.environ.setdefault("MANIM_CJK_FONT", "Noto Sans CJK SC")

    output_dir = os.path.dirname(output_path)
    os.makedirs(output_dir, exist_ok=True)

    media_dir = os.path.join(root, "media")
    if os.path.exists(media_dir):
        shutil.rmtree(media_dir, ignore_errors=True)

    out_name = os.path.splitext(os.path.basename(output_path))[0]

    env = os.environ.copy()
    env["MANIM_RENDERER"] = "cairo"
    # Manim 按文件路径加载 templates/*.py，需把 manim 根目录加入 PYTHONPATH
    py_path = env.get("PYTHONPATH", "")
    env["PYTHONPATH"] = root + (os.pathsep + py_path if py_path else "")

    base = find_manim_cmd()
    last_result = None
    for cmd in build_commands(base, script_file, class_name, out_name):
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
        sys.stderr.write(f"CMD: {' '.join(build_commands(base, script_file, class_name, out_name)[0])}\n")
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
