interface CircularProgressProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
}

export function CircularProgress({ progress, size = 320, strokeWidth = 8 }: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="hsl(var(--muted))"
        strokeWidth={strokeWidth}
        fill="none"
        opacity="0.2"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="hsl(var(--primary))"
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-1000 ease-linear"
        style={{
          filter: "drop-shadow(0 0 8px hsl(var(--primary) / 0.4))",
        }}
      />
    </svg>
  );
}
