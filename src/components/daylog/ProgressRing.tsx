interface ProgressRingProps {
  percent: number;
  size?: number;
  stroke?: number;
}

export function ProgressRing({ percent, size = 120, stroke = 10 }: ProgressRingProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = c * (percent / 100);
  const complete = percent >= 100;
  const color = complete ? "var(--color-success)" : "var(--color-primary)";

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-muted)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          style={{ transition: "stroke-dasharray 400ms ease, stroke 200ms" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-semibold tabular-nums" style={{ color }}>
          {Math.round(percent)}%
        </span>
      </div>
    </div>
  );
}
