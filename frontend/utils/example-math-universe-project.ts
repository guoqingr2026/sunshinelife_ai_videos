/** 数学宇宙示例成片 — manim_custom 多镜头 */
export const MATH_UNIVERSE_PROJECT_JSON = JSON.stringify(
  {
    title: "曲线的形状，数学的性格",
    theme: {
      backgroundColor: "#e8f4fc",
      primaryColor: "#2b6cb0",
      secondaryColor: "#e85d75",
      accentColor: "#38a169",
    },
    shots: [
      {
        type: "chapter_banner",
        label: "片头",
        params: { title: "曲线的形状", subtitle: "数学的性格" },
      },
      {
        type: "manim_custom",
        label: "心形线",
        params: {
          scene: "CardioidScene",
          title: "心形线",
          subtitle: "r = 1 - cos θ",
        },
      },
      {
        type: "manim_custom",
        label: "玫瑰线",
        params: {
          scene: "RoseCurveScene",
          title: "玫瑰线",
          k: 5,
          subtitle: "r = sin(5θ)",
        },
      },
      {
        type: "manim_custom",
        label: "洛伦兹·3条彩色",
        params: {
          scene: "LorenzScene",
          title: "洛伦兹吸引子",
          subtitle: "混沌中的蝴蝶",
          n: 3,
          colors: ["#e85d75", "#4a90d9", "#50c878"],
        },
      },
      {
        type: "manim_custom",
        label: "曼德布罗集",
        params: {
          scene: "MandelbrotScene",
          title: "曼德布罗集",
          subtitle: "z_{n+1} = z_n² + c",
        },
      },
      {
        type: "manim_custom",
        label: "朱利亚集",
        params: {
          scene: "JuliaScene",
          title: "朱利亚集",
          c_real: -0.7,
          c_imag: 0.27015,
        },
      },
      {
        type: "typewriter_text",
        label: "结语",
        params: {
          text: "每一条曲线，都是一种数学性格的表达。",
        },
      },
    ],
  },
  null,
  2
);
