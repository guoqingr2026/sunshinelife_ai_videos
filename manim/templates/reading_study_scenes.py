"""读书 / 学习方法专题 — 10 个独立 Manim 镜头（与 type ID 一一对应）"""
import importlib.util
import os

_spec = importlib.util.spec_from_file_location(
    "templates._path", os.path.join(os.path.dirname(__file__), "_path.py")
)
_path_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_path_mod)

from manim import *
from templates._no_tex import apply_no_tex

apply_no_tex()

from templates._layout import mk_title
from templates._params import get_params
from templates._text import mk_text
from templates._theme import apply_scene_theme


def _hdr(p: dict, default: str):
    return mk_title(str(p.get("title") or default))


class ManimOutline(Scene):
    def construct(self):
        theme = apply_scene_theme(self)
        p = get_params({"title": "建立大纲"})
        hdr = _hdr(p, "建立大纲")
        c1 = mk_text("Chapter 1", font_size=36, color=theme.primary)
        c1_1 = mk_text("1-1 小节", font_size=28, color=theme.text).next_to(c1, DOWN, aligned_edge=LEFT)
        c1_2 = mk_text("1-2 小节", font_size=28, color=theme.text).next_to(c1_1, DOWN, aligned_edge=LEFT)
        c2 = mk_text("Chapter 2", font_size=36, color=theme.secondary).next_to(c1, RIGHT, buff=2)
        c2_1 = mk_text("2-1 小节", font_size=28, color=theme.text).next_to(c2, DOWN, aligned_edge=LEFT)
        c2_2 = mk_text("2-2 小节", font_size=28, color=theme.text).next_to(c2_1, DOWN, aligned_edge=LEFT)
        block = VGroup(c1, c1_1, c1_2, c2, c2_1, c2_2).shift(DOWN * 0.3)
        self.play(FadeIn(hdr))
        self.play(Write(c1))
        self.play(LaggedStart(Write(c1_1), Write(c1_2), lag_ratio=0.3))
        self.play(Write(c2))
        self.play(LaggedStart(Write(c2_1), Write(c2_2), lag_ratio=0.3))
        self.wait(1)


class ManimTeacherResources(Scene):
    def construct(self):
        theme = apply_scene_theme(self)
        p = get_params({"title": "老师资源 = 考点方向"})
        hdr = _hdr(p, "老师资源 = 考点方向")
        note1 = Rectangle(width=3, height=1.2, color=theme.primary)
        note2 = Rectangle(width=3, height=1.2, color=theme.secondary)
        note3 = Rectangle(width=3, height=1.2, color=theme.accent)
        t1 = mk_text("讲义", font_size=28).move_to(note1)
        t2 = mk_text("笔记", font_size=28).move_to(note2)
        t3 = mk_text("考古题", font_size=28).move_to(note3)
        group = VGroup(VGroup(note1, t1), VGroup(note2, t2), VGroup(note3, t3)).arrange(DOWN, buff=0.5).shift(LEFT * 3)
        target = Circle(radius=1.2, color=theme.accent)
        target_text = mk_text("考题方向", font_size=30).move_to(target)
        arrows = VGroup(
            Arrow(note1.get_right(), target.get_left(), color=theme.muted),
            Arrow(note2.get_right(), target.get_left(), color=theme.muted),
            Arrow(note3.get_right(), target.get_left(), color=theme.muted),
        )
        self.play(FadeIn(hdr))
        self.play(FadeIn(group))
        self.play(FadeIn(target), FadeIn(target_text))
        self.play(LaggedStart(*[Create(a) for a in arrows], lag_ratio=0.3))
        self.wait(1)


class ManimDrawDiagram(Scene):
    def construct(self):
        theme = apply_scene_theme(self)
        p = get_params({"title": "画出来 = 真正理解"})
        hdr = _hdr(p, "画出来 = 真正理解")
        left = Circle(radius=1, color=theme.primary).shift(LEFT * 1)
        right = Circle(radius=1, color=theme.secondary).shift(RIGHT * 1)
        tube = Line(left.get_right(), right.get_left(), color=theme.accent)
        arrows = VGroup(
            Arrow(LEFT * 3, LEFT * 1, color=theme.muted),
            Arrow(RIGHT * 3, RIGHT * 1, color=theme.muted),
        )
        self.play(FadeIn(hdr))
        self.play(Create(left), Create(right))
        self.play(Create(tube))
        self.play(LaggedStart(*[Create(a) for a in arrows], lag_ratio=0.3))
        self.wait(1)


class ManimCompareTable(Scene):
    def construct(self):
        theme = apply_scene_theme(self)
        p = get_params({
            "title": "比较 = 不再混淆",
            "left_title": "水溶性养分",
            "right_title": "脂溶性养分",
            "left_items": ["易吸收", "直接进入血液", "不需载体"],
            "right_items": ["吸收较慢", "需载体蛋白", "储存在脂肪组织"],
        })
        hdr = _hdr(p, "比较 = 不再混淆")
        left = mk_text(str(p.get("left_title", "左")), font_size=32, color=theme.primary)
        right = mk_text(str(p.get("right_title", "右")), font_size=32, color=theme.secondary)
        left_items = p.get("left_items") or []
        right_items = p.get("right_items") or []
        table_left = VGroup(*[mk_text(str(s), font_size=26) for s in left_items]).arrange(DOWN).next_to(left, DOWN)
        table_right = VGroup(*[mk_text(str(s), font_size=26) for s in right_items]).arrange(DOWN).next_to(right, DOWN)
        g1 = VGroup(left, table_left).shift(LEFT * 3)
        g2 = VGroup(right, table_right).shift(RIGHT * 3)
        self.play(FadeIn(hdr))
        self.play(FadeIn(g1), FadeIn(g2))
        self.wait(1)


class ManimVocabularyFocus(Scene):
    def construct(self):
        theme = apply_scene_theme(self)
        p = get_params({"title": "单字击破法", "word": "Betray", "blur_text": "一整页单字……"})
        hdr = _hdr(p, "单字击破法")
        blurred = mk_text(str(p.get("blur_text", "一整页单字……")), font_size=28, color=theme.muted).set_opacity(0.35)
        word = mk_text(str(p.get("word", "Betray")), font_size=60, color=theme.accent)
        self.play(FadeIn(hdr))
        self.play(FadeIn(blurred))
        self.play(Transform(blurred, word))
        self.play(word.animate.scale(1.2))
        self.play(word.animate.scale(1 / 1.2))
        self.wait(1)


class ManimMultiExplanation(Scene):
    def construct(self):
        theme = apply_scene_theme(self)
        p = get_params({
            "title": "不同讲法 = 不同理解角度",
            "question": "这题到底怎么解？",
            "labels": ["同学 A 的解释", "同学 B 的解释", "老师的解释"],
        })
        hdr = _hdr(p, "不同讲法 = 不同理解角度")
        question = mk_text(str(p.get("question", "这题到底怎么解？")), font_size=34)
        labels = p.get("labels") or ["同学 A", "同学 B", "老师"]
        colors = [theme.primary, theme.secondary, theme.accent]
        bubbles = []
        for i, lbl in enumerate(labels[:3]):
            box = RoundedRectangle(width=3.2, height=1.1, corner_radius=0.15, color=colors[i % 3])
            txt = mk_text(str(lbl), font_size=22).move_to(box)
            bubbles.append(VGroup(box, txt))
        b0, b1, b2 = bubbles[0].shift(LEFT * 3 + UP * 0.8), bubbles[1].shift(RIGHT * 3 + UP * 0.8), bubbles[2].shift(DOWN * 1.2)
        self.play(FadeIn(hdr))
        self.play(FadeIn(question))
        self.play(FadeIn(b0), FadeIn(b1), FadeIn(b2))
        self.wait(1)


class ManimExplanationHighlight(Scene):
    def construct(self):
        theme = apply_scene_theme(self)
        p = get_params({
            "title": "详解中的关键字",
            "keywords": "活化能 · 催化剂 · 反应路径",
        })
        hdr = _hdr(p, "详解中的关键字")
        explanation = mk_text(str(p.get("keywords", "关键字")), font_size=32, color=theme.accent)
        box = SurroundingRectangle(explanation, color=theme.primary, buff=0.2)
        self.play(FadeIn(hdr))
        self.play(FadeIn(explanation))
        self.play(Create(box))
        self.play(Indicate(explanation, color=theme.accent))
        self.wait(1)


class ManimRecallPage(Scene):
    def construct(self):
        theme = apply_scene_theme(self)
        p = get_params({
            "title": "翻页复述法",
            "page_text": "主动运输：ATP → ADP",
            "prompt": "我学到了什么？",
        })
        hdr = _hdr(p, "翻页复述法")
        page = Rectangle(width=4, height=5, color=theme.muted)
        text = mk_text(str(p.get("page_text", "")), font_size=26).move_to(page)
        bubble = RoundedRectangle(width=4, height=1.5, corner_radius=0.15, color=theme.primary).shift(DOWN * 2)
        bubble_text = mk_text(str(p.get("prompt", "我学到了什么？")), font_size=26).move_to(bubble)
        self.play(FadeIn(hdr))
        self.play(FadeIn(page), FadeIn(text))
        self.play(FadeIn(bubble), FadeIn(bubble_text))
        self.wait(1)


class ManimPhoneFade(Scene):
    def construct(self):
        theme = apply_scene_theme(self)
        p = get_params({"title": "减少干扰 = 习惯养成", "timeline": "半天 → 一天 → 两天"})
        hdr = _hdr(p, "减少干扰 = 习惯养成")
        phone = Square(color=theme.accent).scale(1.5)
        timeline = mk_text(str(p.get("timeline", "半天 → 一天 → 两天")), font_size=30).shift(DOWN * 2)
        self.play(FadeIn(hdr))
        self.play(FadeIn(phone))
        self.play(phone.animate.set_opacity(0.3).scale(0.5))
        self.play(FadeIn(timeline))
        self.wait(1)


class ManimKeyBook(Scene):
    def construct(self):
        theme = apply_scene_theme(self)
        p = get_params({
            "title": "考前重点本",
            "keywords": ["易忘点 1", "易忘点 2", "易忘点 3"],
        })
        hdr = _hdr(p, "考前重点本")
        thick = Rectangle(width=4, height=5, color=theme.muted)
        thin = Rectangle(width=4, height=1, color=theme.accent)
        kws = p.get("keywords") or ["易忘点 1", "易忘点 2", "易忘点 3"]
        keywords = VGroup(*[mk_text(str(k), font_size=26) for k in kws]).arrange(DOWN).next_to(thin, DOWN, buff=0.4)
        self.play(FadeIn(hdr))
        self.play(FadeIn(thick))
        self.play(Transform(thick, thin))
        self.play(FadeIn(keywords))
        self.wait(1)
