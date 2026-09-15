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
    if rel.startswith("files/"):
        rel = rel[len("files/") :]
    candidates = []
    if storage:
        candidates.append(os.path.join(storage, "files", rel))
        candidates.append(os.path.join(storage, rel))
    manim_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    candidates.append(os.path.join(manim_root, "assets", os.path.basename(rel)))
    for candidate in candidates:
        if candidate and os.path.exists(candidate):
            return candidate
    return raw
