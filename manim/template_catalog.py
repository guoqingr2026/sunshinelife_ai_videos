"""Manim 场景注册表 — render_task.py 与前端 catalog 保持一致"""

TEMPLATES = {
    # 工程 / 物理 / 电气
    "pn_junction": "templates.pn_junction.PNJunction",
    "band_structure": "templates.band_structure.BandStructure",
    "current_arrow": "templates.current_arrow.CurrentArrow",
    "photon_breakdown": "templates.photon_breakdown.PhotonBreakdown",
    "semiconductor_layers": "templates.semiconductor_layers.SemiconductorLayers",
    "mosfet_channel": "templates.mosfet_channel.MosfetChannel",
    "buck_converter": "templates.buck_converter.BuckConverter",
    "sine_waveform": "templates.sine_waveform.SineWaveform",
    "llc_resonant": "templates.llc_resonant.LLCResonant",
    # 数学 / 几何
    "function_graph": "templates.function_graph.FunctionGraphScene",
    "coordinate_grid": "templates.coordinate_grid.CoordinateGrid",
    "vector_sum": "templates.vector_sum.VectorSum",
    "bar_chart": "templates.bar_chart.BarChartScene",
    # 信息图表
    "timeline_horizontal": "templates.timeline_horizontal.TimelineHorizontal",
    "flowchart": "templates.flowchart.FlowchartSimple",
    "forgetting_curve": "templates.forgetting_curve.ForgettingCurve",
    "concept_network": "templates.concept_network.ConceptNetwork",
    "learning_curve": "templates.learning_curve.LearningCurve",
    # 文本动画
    "typewriter_text": "templates.typewriter_text.TypewriterText",
    "keyword_pop": "templates.keyword_pop.KeywordPop",
    "formula_steps": "templates.formula_steps.FormulaSteps",
    "chapter_banner": "templates.chapter_banner.ChapterBanner",
    # 伪 3D / 结构
    "isometric_stack": "templates.isometric_stack.IsometricStack",
    "orbit_paths": "templates.orbit_paths.OrbitPaths",
}
