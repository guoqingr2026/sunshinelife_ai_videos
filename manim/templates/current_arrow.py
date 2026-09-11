from manim import *


class CurrentArrow(Scene):
    def construct(self):
        resistor = Rectangle(width=3, height=1, color=WHITE)
        r_label = Text("R", font_size=36).move_to(resistor)

        wire_left = Line(LEFT * 5, resistor.get_left(), color=WHITE)
        wire_right = Line(resistor.get_right(), RIGHT * 5, color=WHITE)

        arrow = Arrow(LEFT * 4, RIGHT * 4, color=YELLOW, buff=0)
        i_label = Text("I", font_size=28, color=YELLOW).next_to(arrow, UP)

        voltage = Text("V = 9V", font_size=24).to_corner(UL)

        self.play(Create(wire_left), Create(wire_right), Create(resistor))
        self.play(Write(r_label), Write(voltage))
        self.play(GrowArrow(arrow), Write(i_label))
        self.wait(1)
