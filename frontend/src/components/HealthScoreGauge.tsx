interface Props { score: number; size?: number }

function colour(s: number) {
  if (s >= 80) return { stroke: '#22c55e', text: 'text-green-400', label: 'Excellent' }
  if (s >= 50) return { stroke: '#f59e0b', text: 'text-amber-400', label: 'Fair' }
  return       { stroke: '#ef4444', text: 'text-red-400',   label: 'Poor' }
}

export function HealthScoreGauge({ score, size = 116 }: Props) {
  const { stroke, text, label } = colour(score)
  const r  = 46
  const c  = 2 * Math.PI * r
  const arc = c * 0.75                      // 270° sweep
  const filled = arc * (score / 100)

  return (
    <div className="flex flex-col items-center gap-1 select-none">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 100 100"
          style={{ transform: 'rotate(135deg)' }}>
          {/* track */}
          <circle cx="50" cy="50" r={r} fill="none" stroke="#1e2333" strokeWidth="8"
            strokeDasharray={`${arc} ${c - arc}`} strokeLinecap="round"/>
          {/* fill */}
          <circle cx="50" cy="50" r={r} fill="none" stroke={stroke} strokeWidth="8"
            strokeDasharray={`${filled} ${arc - filled + (c - arc)}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.9s cubic-bezier(.4,0,.2,1)' }}/>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-[22px] font-bold leading-none ${text}`}>{score}</span>
          <span className="text-[10px] text-slate-600 mt-0.5">/ 100</span>
        </div>
      </div>
      <span className={`text-[10px] font-semibold uppercase tracking-widest ${text}`}>{label}</span>
    </div>
  )
}
