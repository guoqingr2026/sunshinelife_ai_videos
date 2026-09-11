import json
import sys
import os
import shutil
import subprocess
import glob

from template_catalog import TEMPLATES


def find_manim_cmd():
    import shutil as sh
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

    scene_class = TEMPLATES.get(task_type, TEMPLATES["pn_junction"])
    module_path, class_name = scene_class.rsplit(".", 1)

    os.environ["MANIM_PARAMS"] = json.dumps(params)
    os.environ["MANIM_OUTPUT"] = output_path
    os.environ["MANIM_RENDERER"] = "cairo"

    output_dir = os.path.dirname(output_path)
    os.makedirs(output_dir, exist_ok=True)

    root = os.path.dirname(os.path.abspath(__file__))
    media_dir = os.path.join(root, "media")
    if os.path.exists(media_dir):
        shutil.rmtree(media_dir, ignore_errors=True)

    script_file = f"{module_path.replace('.', '/')}.py"
    out_name = os.path.splitext(os.path.basename(output_path))[0]

    env = os.environ.copy()
    env["MANIM_RENDERER"] = "cairo"

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
