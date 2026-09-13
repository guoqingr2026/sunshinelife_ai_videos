"""Manim scene registry — keep in sync with frontend/utils/manim-capabilities.ts"""

TEMPLATES = {
    # Layer 1 — engineering
    "pn_junction": "templates.pn_junction.PNJunction",
    "band_structure": "templates.band_structure.BandStructure",
    "current_arrow": "templates.current_arrow.CurrentArrow",
    "photon_breakdown": "templates.photon_breakdown.PhotonBreakdown",
    "semiconductor_layers": "templates.semiconductor_layers.SemiconductorLayers",
    "mosfet_channel": "templates.mosfet_channel.MosfetChannel",
    "buck_converter": "templates.buck_converter.BuckConverter",
    "sine_waveform": "templates.sine_waveform.SineWaveform",
    "llc_resonant": "templates.llc_resonant.LLCResonant",
    # Layer 1 — math
    "function_graph": "templates.function_graph.FunctionGraphScene",
    "coordinate_grid": "templates.coordinate_grid.CoordinateGrid",
    "vector_sum": "templates.vector_sum.VectorSum",
    "bar_chart": "templates.bar_chart.BarChartScene",
    # Layer 2 — math / charts
    "pie_chart": "templates.pie_chart.PieChartScene",
    "line_chart_compare": "templates.line_chart_compare.LineChartCompare",
    # Layer 1 — infographic
    "timeline_horizontal": "templates.timeline_horizontal.TimelineHorizontal",
    "flowchart": "templates.flowchart.FlowchartSimple",
    "forgetting_curve": "templates.forgetting_curve.ForgettingCurve",
    "concept_network": "templates.concept_network.ConceptNetwork",
    "learning_curve": "templates.learning_curve.LearningCurve",
    # Layer 1 — text
    "typewriter_text": "templates.typewriter_text.TypewriterText",
    "keyword_pop": "templates.keyword_pop.KeywordPop",
    "formula_steps": "templates.formula_steps.FormulaSteps",
    "chapter_banner": "templates.chapter_banner.ChapterBanner",
    # Layer 1 — structure
    "isometric_stack": "templates.isometric_stack.IsometricStack",
    "orbit_paths": "templates.orbit_paths.OrbitPaths",
    # Layer 2 — engineering / structure / advanced anim
    "circuit_loop": "templates.circuit_loop.CircuitLoop",
    "band_temperature": "templates.band_temperature.BandTemperature",
    "crystal_lattice": "templates.crystal_lattice.CrystalLattice",
    "code_highlight": "templates.code_highlight.CodeHighlight",
    "transform_demo": "templates.transform_demo.TransformDemo",
    # Layer 2 — MathTex (texlive optional, text fallback on ECS)
    "mathtex_formula": "templates.mathtex_formula.MathTexFormula",
    "mathtex_derivation": "templates.mathtex_derivation.MathTexDerivation",
    # Layer 2 — 3D (OpenGL + xvfb on headless)
    "scene_3d_surface": "templates.scene_3d_surface.Scene3DSurface",
    "scene_3d_orbit": "templates.scene_3d_orbit.Scene3DOrbit",
    # Layer 2 — media (SVG / image / video)
    "image_focus": "templates.image_focus.ImageFocus",
    "svg_icon": "templates.svg_icon.SvgIcon",
    "video_embed": "templates.video_embed.VideoEmbed",
    # Layer 2 — English learning
    "vocab_card": "templates.vocab_card.VocabCard",
    "grammar_highlight": "templates.grammar_highlight.GrammarHighlight",
    "dialogue_scene": "templates.dialogue_scene.DialogueScene",
    # Layer 3 — custom
    "custom_dsl": "templates.custom_dsl.CustomDSLScene",
    # Monty Hall / 概率科普
    "manim_probability_tree": "templates.manim_probability_tree.ManimProbabilityTree",
    "manim_formula": "templates.manim_formula.ManimFormula",
    "manim_simulation_chart": "templates.manim_simulation_chart.ManimSimulationChart",
}
