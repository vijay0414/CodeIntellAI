import type { BatchSummary } from '../types'
import { HealthScoreGauge } from './HealthScoreGauge'

interface Props { summary: BatchSummary }

export function BatchSummaryCard({ summary }: Props) {
  const score = Math.round(summary.average_health_score)

  return (
    <div className="rounded-xl border border-[#2e1a1a] bg-[#1a1010] p-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#7a5050] mb-4">
        Batch Summary
      </p>

      <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
        {/* Gauge */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <HealthScoreGauge score={score} />
          <p className="text-[10px] text-[#5a3030]">Avg Health</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 flex-1 w-full">
          {[
            { label: 'Total files',   value: String(summary.total_files),          color: 'text-white' },
            { label: 'Total issues',  value: String(summary.total_issues),          color: 'text-red-300' },
            { label: 'Top category',  value: summary.most_common_category,          color: 'text-amber-300' },
            { label: 'Worst file',    value: summary.worst_file,                    color: 'text-red-400' },
            { label: 'Best file',     value: summary.best_file,                     color: 'text-green-400' },
            { label: 'Avg score',     value: `${summary.average_health_score}/100`, color: score >= 80 ? 'text-green-400' : score >= 50 ? 'text-amber-400' : 'text-red-400' },
          ].map(stat => (
            <div key={stat.label}
              className="rounded-lg border border-[#2e1a1a] bg-[#150909] px-3 py-2.5">
              <p className="text-[10px] uppercase tracking-[0.15em] text-[#5a3030] mb-1">
                {stat.label}
              </p>
              <p className={`text-sm font-semibold truncate ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
