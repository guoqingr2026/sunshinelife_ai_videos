import { useState } from "react";

export type CurveMode = "parametric_2d" | "polar_2d" | "parametric_3d";

export interface FormulaCurveParams {
  title: string;
  subtitle?: string;
  mode: CurveMode;
  x?: string;
  y?: string;
  z?: string;
  r?: string;
  t_min: number;
  t_max: number;
  curve_run_time?: number;
  hold_seconds?: number;
  rotate_seconds?: number;
}

const PRESETS: Array<{ id: string; label: string; params: FormulaCurveParams }> = [
  {
    id: "lissajous",
    label: "李萨如 2D",
    params: {
      title: "李萨如图形",
      mode: "parametric_2d",
      x: "sin(3*t)",
      y: "cos(4*t)",
      t_min: 0,
      t_max: 6.28318,
    },
  },
  {
    id: "harmonic_2d",
    label: "谐波叠加 2D",
    params: {
      title: "谐波叠加",
      mode: "parametric_2d",
      x: "sin(3*t) + 0.5*sin(5*t)",
      y: "cos(4*t) + 0.5*cos(6*t)",
      t_min: 0,
      t_max: 20,
      curve_run_time: 5,
    },
  },
  {
    id: "flower",
    label: "迭代花朵",
    params: {
      title: "迭代花朵",
      mode: "polar_2d",
      r: "sin(5*t)*cos(3*t)",
      t_min: 0,
      t_max: 6.28318,
    },
  },
  {
    id: "ribbon_3d",
    label: "3D 谐波光带",
    params: {
      title: "3D 谐波光带",
      mode: "parametric_3d",
      x: "sin(2*t) + 0.3*sin(5*t)",
      y: "cos(3*t) + 0.3*cos(7*t)",
      z: "0.6*sin(4*t)",
      t_min: 0,
      t_max: 20,
      hold_seconds: 6,
      rotate_seconds: 6,
    },
  },
  {
    id: "harmonic_3d",
    label: "3D 谐波",
    params: {
      title: "3D 谐波曲线",
      mode: "parametric_3d",
      x: "sin(3*t)",
      y: "cos(4*t)",
      z: "sin(2*t)",
      t_min: 0,
      t_max: 20,
    },
  },
];

const FORMULA_REF = [
  { name: "sin(t), cos(t)", example: "李萨如、圆" },
  { name: "sin(a*t) + b*sin(c*t)", example: "谐波叠加" },
  { name: "sin(k*t)*cos(m*t)", example: "极坐标花朵（mode=polar_2d）" },
  { name: "(R-r)*cos(t) + d*cos((R-r)/r*t)", example: "Spirograph（用 x,y 参数式）" },
  { name: "exp(1j*t) 实部/虚部", example: "复平面曲线请用 ComplexCurveScene" },
  { name: "t", example: "阿基米德螺线极坐标: r=a+b*t" },
];

interface Props {
  onApply: (params: FormulaCurveParams) => void;
}

export default function FormulaCurveBuilder({ onApply }: Props) {
  const [mode, setMode] = useState<CurveMode>("parametric_2d");
  const [title, setTitle] = useState("公式曲线");
  const [x, setX] = useState("sin(3*t)");
  const [y, setY] = useState("cos(4*t)");
  const [z, setZ] = useState("0.6*sin(4*t)");
  const [r, setR] = useState("sin(5*t)*cos(3*t)");
  const [tMin, setTMin] = useState(0);
  const [tMax, setTMax] = useState(6.28318);

  const buildParams = (): FormulaCurveParams => {
    const base: FormulaCurveParams = {
      title,
      mode,
      t_min: tMin,
      t_max: tMax,
      curve_run_time: 4,
      hold_seconds: mode === "parametric_3d" ? 5 : 3,
      rotate_seconds: mode === "parametric_3d" ? 5 : undefined,
    };
    if (mode === "polar_2d") return { ...base, r };
    if (mode === "parametric_3d") return { ...base, x, y, z };
    return { ...base, x, y };
  };

  const applyPreset = (p: FormulaCurveParams) => {
    setMode(p.mode);
    setTitle(p.title);
    setX(p.x ?? "sin(t)");
    setY(p.y ?? "cos(t)");
    setZ(p.z ?? "0");
    setR(p.r ?? "sin(t)");
    setTMin(p.t_min);
    setTMax(p.t_max);
    onApply(p);
  };

  return (
    <div className="panel space-y-3 text-sm">
      <div>
        <p className="font-semibold text-ink">自动曲线生成器</p>
        <p className="text-xs text-muted mt-1">
          输入以 <code className="text-primary">t</code> 为变量的公式，自动生成 Manim 曲线动画（类型{" "}
          <code className="text-primary">formula_curve</code>）。支持 sin/cos/exp/sqrt 等。
        </p>
      </div>

      <div className="flex flex-wrap gap-1">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            className="pill-tab text-xs"
            onClick={() => applyPreset(p.params)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <label className="block text-xs">
          <span className="text-muted">模式</span>
          <select
            className="input-field p-1.5 mt-0.5 w-full text-xs"
            value={mode}
            onChange={(e) => setMode(e.target.value as CurveMode)}
          >
            <option value="parametric_2d">2D 参数 x(t), y(t)</option>
            <option value="polar_2d">2D 极坐标 r(t)</option>
            <option value="parametric_3d">3D 参数 x,y,z（需 OpenGL）</option>
          </select>
        </label>
        <label className="block text-xs">
          <span className="text-muted">标题</span>
          <input
            className="input-field p-1.5 mt-0.5 w-full text-xs"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
      </div>

      {mode === "polar_2d" ? (
        <label className="block text-xs">
          <span className="text-muted">r(t)</span>
          <input
            className="input-field p-1.5 mt-0.5 w-full font-mono text-xs"
            value={r}
            onChange={(e) => setR(e.target.value)}
          />
        </label>
      ) : (
        <div className="grid grid-cols-1 gap-2">
          <label className="block text-xs">
            <span className="text-muted">x(t)</span>
            <input
              className="input-field p-1.5 mt-0.5 w-full font-mono text-xs"
              value={x}
              onChange={(e) => setX(e.target.value)}
            />
          </label>
          <label className="block text-xs">
            <span className="text-muted">y(t)</span>
            <input
              className="input-field p-1.5 mt-0.5 w-full font-mono text-xs"
              value={y}
              onChange={(e) => setY(e.target.value)}
            />
          </label>
          {mode === "parametric_3d" && (
            <label className="block text-xs">
              <span className="text-muted">z(t)</span>
              <input
                className="input-field p-1.5 mt-0.5 w-full font-mono text-xs"
                value={z}
                onChange={(e) => setZ(e.target.value)}
              />
            </label>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <label className="block text-xs">
          <span className="text-muted">t_min</span>
          <input
            type="number"
            step="any"
            className="input-field p-1.5 mt-0.5 w-full text-xs"
            value={tMin}
            onChange={(e) => setTMin(parseFloat(e.target.value) || 0)}
          />
        </label>
        <label className="block text-xs">
          <span className="text-muted">t_max</span>
          <input
            type="number"
            step="any"
            className="input-field p-1.5 mt-0.5 w-full text-xs"
            value={tMax}
            onChange={(e) => setTMax(parseFloat(e.target.value) || 1)}
          />
        </label>
      </div>

      <button
        type="button"
        className="btn-primary text-xs w-full"
        onClick={() => onApply(buildParams())}
      >
        填入参数 JSON 并选中 formula_curve
      </button>

      <details className="text-xs">
        <summary className="cursor-pointer text-muted font-semibold">公式参考</summary>
        <ul className="mt-2 space-y-1 text-muted">
          <li>
            变量仅 <code className="text-primary">t</code>；常数 <code className="text-primary">pi</code>、
            <code className="text-primary">tau</code>
          </li>
          <li>函数：sin, cos, tan, exp, log, sqrt, abs, pow, min, max</li>
          {FORMULA_REF.map((row) => (
            <li key={row.name}>
              <code className="text-primary">{row.name}</code> — {row.example}
            </li>
          ))}
          <li>
            一键成片 JSON：{" "}
            <code className="text-primary">{`{ "type": "formula_curve", "params": { "mode": "...", "x": "..." } }`}</code>
          </li>
          <li>
            或 <code className="text-primary">manim_custom</code> +{" "}
            <code className="text-primary">scene: FormulaCurve3DScene</code>
          </li>
        </ul>
      </details>
    </div>
  );
}
