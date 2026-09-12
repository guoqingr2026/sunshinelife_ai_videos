"""Stub LaTeX only when texlive is missing (allows MathTex when installed)."""
import shutil

_APPLIED = False


def apply_no_tex():
    global _APPLIED
    if _APPLIED:
        return
    if shutil.which("latex"):
        return
    try:
        import manim.utils.tex_file_writing as tw

        def compile_tex_stub(tex_file, tex_compiler, output_format=".dvi"):
            out = tex_file.with_suffix(output_format)
            out.parent.mkdir(parents=True, exist_ok=True)
            if not out.exists():
                out.write_bytes(b"% stub")
            return str(out)

        tw.compile_tex = compile_tex_stub
        _APPLIED = True
    except Exception:
        pass
