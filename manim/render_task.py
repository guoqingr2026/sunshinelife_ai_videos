import json
import sys
import os
import subprocess

TEMPLATES = {
    "pn_junction": "templates.pn_junction.PNJunction",
    "band_structure": "templates.band_structure.BandStructure",
    "current_arrow": "templates.current_arrow.CurrentArrow",
    "photon_breakdown": "templates.photon_breakdown.PhotonBreakdown",
    "semiconductor_layers": "templates.semiconductor_layers.SemiconductorLayers",
}


def main():
    payload = json.loads(sys.argv[1])
    task_type = payload.get("type", "pn_junction")
    output_path = payload.get("outputPath", "output.mp4")
    params = payload.get("params", {})

    scene_class = TEMPLATES.get(task_type, TEMPLATES["pn_junction"])
    module_path, class_name = scene_class.rsplit(".", 1)

    os.environ["MANIM_PARAMS"] = json.dumps(params)
    os.environ["MANIM_OUTPUT"] = output_path

    output_dir = os.path.dirname(output_path)
    os.makedirs(output_dir, exist_ok=True)

    cmd = [
        sys.executable, "-m", "manim", "-ql", "--format=mp4",
        "-o", os.path.splitext(os.path.basename(output_path))[0],
        f"{module_path.replace('.', '/')}.py",
        class_name,
    ]

    result = subprocess.run(cmd, cwd=os.path.dirname(os.path.abspath(__file__)))

    media_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "media", "videos")
    if os.path.exists(media_dir):
        for root, _, files in os.walk(media_dir):
            for f in files:
                if f.endswith(".mp4"):
                    src = os.path.join(root, f)
                    import shutil
                    shutil.copy2(src, output_path)
                    sys.exit(0)

    sys.exit(result.returncode)


if __name__ == "__main__":
    main()
