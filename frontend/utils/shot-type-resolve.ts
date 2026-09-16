/**
 * 与 backend shot-plan-spec.ts 的 resolveManimType / resolveRemotionType 对齐（前端校验用）
 */

import { MANIM_TEMPLATES } from "./manim-catalog";

const MANIM_IDS = new Set(MANIM_TEMPLATES.map((t) => t.id));

/** 与 backend MANIM_TYPE_ALIASES 保持同步 */
export const MANIM_SHOT_ALIASES: Record<string, string> = {
  memory_recall: "concept_network",
  active_recall: "typewriter_text",
  neural_connection: "concept_network",
  concept_simplify: "formula_steps",
  feynman: "concept_network",
  feynman_technique: "concept_network",
  spaced_repetition: "forgetting_curve",
  ebbinghaus: "forgetting_curve",
  spaced_repetition_curve: "forgetting_curve",
  learning_tips: "typewriter_text",
  knowledge_tree: "concept_network",
  mind_map: "concept_network",
  concept_tree: "concept_network",
  interleave: "flowchart",
  deep_work: "keyword_pop",
  exam_simulation: "timeline_horizontal",
  study_group: "concept_network",
  brain_health: "learning_curve",
  vocabulary: "vocab_card",
  vocab: "vocab_card",
  grammar: "grammar_highlight",
  dialogue: "dialogue_scene",
  conversation: "dialogue_scene",
  mathtex: "mathtex_formula",
  latex_formula: "mathtex_formula",
  derivation: "mathtex_derivation",
  formula_derivation: "mathtex_derivation",
  "3d_surface": "scene_3d_surface",
  "3d_orbit": "scene_3d_orbit",
  three_d: "scene_3d_surface",
  cardioid: "manim_cardioid",
  rose_curve: "manim_rose_curve",
  archimedean_spiral: "manim_archimedean_spiral",
  exponential_spiral: "manim_exponential_spiral",
  lemniscate: "manim_lemniscate",
  cycloid: "manim_cycloid",
  lorenz_attractor: "manim_lorenz_attractor",
  mandelbrot: "manim_mandelbrot_zoom",
  mandelbrot_zoom: "manim_mandelbrot_zoom",
  lissajous: "manim_lissajous",
  custom_scene: "manim_custom",
  universe_scene: "manim_custom",
  julia_set: "manim_julia_set",
  koch_snowflake: "manim_koch_snowflake",
  three_body: "manim_three_body",
  curve_3d: "manim_curve_3d",
  rossler: "manim_rossler",
  parametric_surface: "manim_parametric_surface",
  parametric_curve: "manim_parametric_curve",
  moving_frame_box: "manim_moving_frame_box",
  point_with_trace: "manim_point_with_trace",
  vector_arrow: "manim_vector_arrow",
  brace_annotation: "manim_brace_annotation",
  sin_cos_plot: "manim_sin_cos_plot",
  point_on_path: "manim_point_on_path",
  moving_angle: "manim_moving_angle",
  sine_unit_circle: "manim_sine_unit_circle",
  boolean_ops: "manim_boolean_ops",
  following_camera: "manim_following_camera",
  graph_area: "manim_graph_area",
  heat_diagram: "manim_heat_diagram",
  curve_formula: "formula_curve",
  image: "image_focus",
  picture: "image_focus",
  svg: "svg_icon",
  video_clip: "video_embed",
  video: "video_embed",
};

/** 与 backend REMOTION_TYPE_ALIASES 保持同步 */
export const REMOTION_SHOT_ALIASES: Record<string, string> = {
  cornell_notes: "bullet_list",
  cornell: "bullet_list",
  notes: "bullet_list",
  title_card: "title",
  outro: "fade_text",
  manim_clip: "fade_text",
  image_bookend: "image_clip",
  start_image: "image_clip",
  end_image: "image_clip",
  bookend_image: "image_clip",
  split_layout: "composite_split",
  vertical_split: "composite_split",
  pip_video: "composite_pip",
  picture_in_picture: "composite_pip",
};

const REMOTION_SHOT_TYPES = new Set([
  "title",
  "chapter",
  "bullet_list",
  "fade_text",
  "subtitle",
  "quote",
  "flow_steps",
  "timeline_bar",
  "formula_card",
  "compare",
  "arrow",
  "stat",
  "params",
  "remotion_doors",
  "remotion_open_door",
  "remotion_car_reveal",
  "image_clip",
  "composite_split",
  "composite_pip",
]);

const COMPOSITE_TYPES = new Set(["composite_split", "composite_pip"]);

export function resolveManimShotType(type: string): string | null {
  const t = type.trim().toLowerCase();
  if (MANIM_IDS.has(t)) return t;
  const alias = MANIM_SHOT_ALIASES[t];
  if (alias && MANIM_IDS.has(alias)) return alias;
  return null;
}

export function resolveRemotionShotType(type: string): string | null {
  const t = type.trim().toLowerCase();
  if (REMOTION_SHOT_TYPES.has(t)) return t;
  const alias = REMOTION_SHOT_ALIASES[t];
  if (alias && REMOTION_SHOT_TYPES.has(alias)) return alias;
  return null;
}

export function isCompositeShotType(type: string): boolean {
  const resolved = resolveRemotionShotType(type);
  return resolved ? COMPOSITE_TYPES.has(resolved) : false;
}

export type ShotKind = "manim" | "remotion" | "composite";

export function classifyShotType(type: string): ShotKind | null {
  if (isCompositeShotType(type)) return "composite";
  if (resolveManimShotType(type)) return "manim";
  if (resolveRemotionShotType(type)) return "remotion";
  return null;
}

export function analyzeProjectShots(shots: Array<{ type: string }> | undefined) {
  if (!shots?.length) return { manim: 0, remotion: 0, unknown: [] as string[] };
  let manim = 0;
  let remotion = 0;
  const unknown: string[] = [];
  for (const s of shots) {
    const kind = classifyShotType(s.type);
    if (kind === "composite") {
      remotion++;
      manim++;
    } else if (kind === "manim") manim++;
    else if (kind === "remotion") remotion++;
    else unknown.push(s.type);
  }
  return { manim, remotion, unknown };
}
