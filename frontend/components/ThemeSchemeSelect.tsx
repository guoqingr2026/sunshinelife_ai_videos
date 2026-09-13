import { COLOR_SCHEMES } from "../utils/remotion-presets";

interface Props {
  value: number;
  onChange: (index: number) => void;
  disabled?: boolean;
  className?: string;
}

export default function ThemeSchemeSelect({ value, onChange, disabled, className }: Props) {
  const selected = COLOR_SCHEMES[value] ?? COLOR_SCHEMES[0];

  return (
    <div className={className}>
      <label className="block text-sm text-muted mb-2 font-semibold">成片配色</label>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className="input-field p-2 text-sm max-w-md"
      >
        {COLOR_SCHEMES.map((scheme, i) => (
          <option key={scheme.name} value={i}>
            {scheme.name}
          </option>
        ))}
      </select>
      <div className="flex gap-2 mt-2 items-center">
        {(["primaryColor", "secondaryColor", "backgroundColor", "accentColor"] as const).map(
          (key) => (
            <span
              key={key}
              className="w-8 h-8 rounded-lg border border-border shadow-sm"
              style={{ backgroundColor: selected[key] }}
              title={key}
            />
          )
        )}
        <span className="text-xs text-muted ml-1">预览色板</span>
      </div>
      <p className="text-xs text-muted mt-1">
        也可在项目 JSON 中加 <code className="text-primary">theme</code> 块；页面选择器优先用于成片。
      </p>
    </div>
  );
}
