import { FONT_PRESETS } from "../utils/typography-presets";

interface Props {
  value: string;
  onChange: (fontPresetId: string) => void;
  disabled?: boolean;
  className?: string;
}

export default function FontPresetSelect({ value, onChange, disabled, className }: Props) {
  const selected = FONT_PRESETS.find((f) => f.id === value) ?? FONT_PRESETS[0];

  return (
    <div className={className}>
      <label className="block text-sm text-muted mb-2 font-semibold">成片字体</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="input-field p-2 text-sm max-w-md"
      >
        {FONT_PRESETS.map((f) => (
          <option key={f.id} value={f.id}>
            {f.label}
          </option>
        ))}
      </select>
      {selected.desc && <p className="text-xs text-muted mt-1">{selected.desc}</p>}
      <p className="text-xs text-muted mt-1">
        Remotion 用 CSS 字体栈；Manim 用系统字体名（ECS 需已安装，如 <code className="text-primary">fonts-noto-cjk</code>）。
      </p>
    </div>
  );
}
