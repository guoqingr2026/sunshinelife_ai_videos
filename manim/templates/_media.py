import os


def resolve_media_path(path_or_url: str) -> str:
    """Resolve /files/... URL or relative path to absolute storage path."""
    raw = str(path_or_url).strip()
    if not raw:
        return ""
    if os.path.isabs(raw) and os.path.exists(raw):
        return raw
    storage = os.environ.get("MANIM_STORAGE_ROOT", "")
    rel = raw
    if "/files/" in rel:
        rel = rel.split("/files/", 1)[1]
    rel = rel.lstrip("/")
    if storage:
        candidate = os.path.join(storage, "files", rel.replace("files/", "", 1) if rel.startswith("files/") else rel)
        if os.path.exists(candidate):
            return candidate
        candidate2 = os.path.join(storage, rel)
        if os.path.exists(candidate2):
            return candidate2
    manim_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    asset = os.path.join(manim_root, "assets", os.path.basename(rel))
    if os.path.exists(asset):
        return asset
    return raw
