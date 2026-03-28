interface ProgressBarProps {
  value: number;
  total: number;
  className?: string;
}

export default function ProgressBar({ value, total, className = '' }: ProgressBarProps) {
  const pct = total === 0 ? 0 : Math.min(100, Math.round((value / total) * 100));
  const glowing = pct >= 60;
  const complete = pct >= 100;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex-1 bg-surface-container-highest/90 rounded-full h-3 overflow-hidden shadow-inner-sm">
        <div
          className={`h-3 rounded-full transition-all duration-700 ease-out ${complete ? 'progress-shimmer' : 'bg-gradient-to-r from-primary-dim to-primary'}`}
          style={{
            width: `${pct}%`,
            boxShadow: glowing ? '0 0 12px rgba(71,101,80,0.55), 0 0 4px rgba(71,101,80,0.35)' : 'none',
          }}
        />
      </div>
      <span className="font-display font-bold text-sm text-primary tabular-nums w-10 text-right leading-none">
        {pct}%
      </span>
    </div>
  );
}
