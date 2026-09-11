from manim import *
from templates._text import mk_text


class SemiconductorLayers(Scene):
    def construct(self):
        layers = VGroup()
        colors = [BLUE, GREEN, RED, ORANGE, PURPLE]
        labels = ["Substrate", "Buffer", "Active", "Cladding", "Contact"]

        for i, (color, label) in enumerate(zip(colors, labels)):
            rect = Rectangle(width=6, height=0.6, color=color, fill_opacity=0.5)
            rect.shift(DOWN * i * 0.7)
            text = mk_text(label, font_size=20).move_to(rect)
            layers.add(VGroup(rect, text))

        layers.move_to(ORIGIN)

        self.play(LaggedStart(*[FadeIn(layer) for layer in layers], lag_ratio=0.3))
        self.wait(1)
