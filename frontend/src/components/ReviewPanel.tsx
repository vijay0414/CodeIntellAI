import { useState } from 'react'
import type { ReviewResult, ReviewIssue, Severity, IssueCategory } from '../types'
import { HealthScoreGauge } from './HealthScoreGauge'
import { PanelSkeleton }    from './Loader'
import { ErrorState }       from './ErrorState'

// ── colour maps ───────────────────────────────────────────────────────────────
const SEV: Record<Severity, { badge: string; bar: string }> = {
  critical: { badge: 'bg-red-500/15 text-red-400 border border-red-500/25',    bar: 'border-l-red-500' },
  high:     { badge: 'bg-orange-500/15 text-orange-400 border border-orange-500/25', bar: 'border-l-orange-500' },
  medium:   { badge: 'bg-amber-500/15 text-amber-400 border border-amber-500/25',    bar: 'border-l-amber-500' },
  low:      { badge: 'bg-green-500/15 text-green-400 border border-green-500/25',    bar: 'border-l-green-500' },
}
const CAT: Record<IssueCategory, string> = {
  bug:         'bg-red-900/30 text-red-300',
  security:    'bg-purple-900/30 text-purple-300',
  performance: 'bg-blue-900/30 text-blue-300',
  style:       'bg-slate-700/50 text-slate-400',
}
const SEV_ORDER: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3 }

// ── issue card ────────────────────────────────────────────────────────────────
function IssueCard({ issue }: { issue: ReviewIssue }) {
  const [open, setOpen] = useState(false)
  const s = SEV[issue.severity]

  return (
    <div className={`card border-l-2 transition-all ${s.bar}`}>
      <div className="flex items-start gap-2 cursor-pointer" onClick={() => setOpen(v => !v)}>
        {issue.line > 0 && (
          <span className="shrink-0 mt-0.5 text-[11px] font-mono text-slate-500
                           bg-[#0b0d12] px-1.5 py-0.5 rounded border border-[#1e2333]">
            L{issue.line}
          </span>
        )}
        <div className="flex flex-wrap gap-1.5 mt-0.5">
          <span className={`badge ${s.badge}`}>{issue.severity}</span>
          <span className={`badge ${CAT[issue.category]}`}>{issue.category}</span>
        </div>
        <svg className={`ml-auto w-4 h-4 text-slate-600 mt-0.5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
        </svg>
      </div>

      <p className="text-sm text-slate-200 mt-2 leading-relaxed">{issue.message}</p>

      {open && (
        <div className="mt-3 pt-3 border-t border-[#1e2333] panel-enter">
          <p className="text-[11px] uppercase tracking-wider text-slate-500 mb-1.5">Suggestion</p>
          <p className="text-sm text-blue-300 leading-relaxed">{issue.suggestion}</p>
        </div>
      )}
    </div>
  )
}

// ── main panel ────────────────────────────────────────────────────────────────
interface Props {
  result:    ReviewResult | null
  isLoading: boolean
  error:     string | null
  onRetry?:  () => void
}

export function ReviewPanel({ result, isLoading, error, onRetry }: Props) {
  const [sortBy, setSortBy] = useState<'severity' | 'line'>('severity')
  const [filter, setFilter] = useState<Severity | 'all'>('all')

  if (isLoading) return <PanelSkeleton />
  if (error)     return <ErrorState message={error} onRetry={onRetry} />

  if (!result) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center panel-enter">
      <div className="w-14 h-14 rounded-2xl bg-[#161a24] border border-[#1e2333] flex items-center justify-center">
        <svg className="w-7 h-7 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      </div>
      <div>
        <p className="text-slate-400 font-medium">No review yet</p>
        <p className="text-slate-600 text-sm mt-1">Paste code above and click Review Code</p>
      </div>
    </div>
  )

  const counts = result.issues.reduce((acc, i) => {
    acc[i.severity] = (acc[i.severity] ?? 0) + 1; return acc
  }, {} as Record<Severity, number>)

  const visible = [...result.issues]
    .filter(i => filter === 'all' || i.severity === filter)
    .sort((a, b) =>
      sortBy === 'severity'
        ? SEV_ORDER[a.severity] - SEV_ORDER[b.severity]
        : a.line - b.line
    )

  return (
    <div className="space-y-5 panel-enter">
      {/* Score + summary */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="card flex flex-col items-center gap-2 px-6 py-5 shrink-0">
          <HealthScoreGauge score={result.health_score} />
          <p className="text-[11px] text-slate-600">Health Score</p>
        </div>

        <div className="card flex-1">
          <p className="text-[11px] uppercase tracking-wider text-slate-500 mb-2">Summary</p>
          <p className="text-sm text-slate-300 leading-relaxed">{result.summary}</p>

          {/* Severity pill filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            {(['critical', 'high', 'medium', 'low'] as Severity[]).map(s =>
              counts[s] ? (
                <button key={s}
                  onClick={() => setFilter(filter === s ? 'all' : s)}
                  className={`badge cursor-pointer transition-opacity ${SEV[s].badge}
                               ${filter !== 'all' && filter !== s ? 'opacity-40' : ''}`}>
                  {counts[s]} {s}
                </button>
              ) : null
            )}
          </div>
        </div>
      </div>

      {/* Issues list */}
      {result.issues.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-300">
              Issues
              <span className="ml-2 text-xs text-slate-600">
                {visible.length}{filter !== 'all' ? ` of ${result.issues.length}` : ''}
              </span>
            </p>
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-600 mr-1">Sort</span>
              {(['severity', 'line'] as const).map(s => (
                <button key={s} onClick={() => setSortBy(s)}
                  className={`px-2.5 py-1 rounded-md capitalize transition-colors ${
                    sortBy === s
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/25'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5">
            {visible.length > 0
              ? visible.map((issue, i) => <IssueCard key={i} issue={issue} />)
              : (
                <div className="card text-center py-6">
                  <p className="text-slate-500 text-sm">No {filter} issues</p>
                  <button className="text-blue-400 text-xs mt-1.5 hover:underline"
                    onClick={() => setFilter('all')}>
                    Show all
                  </button>
                </div>
              )
            }
          </div>
        </>
      )}

      {result.issues.length === 0 && (
        <div className="card text-center py-8">
          <p className="text-green-400 font-semibold">✓ No issues found</p>
          <p className="text-slate-600 text-sm mt-1">Your code looks clean!</p>
        </div>
      )}
    </div>
  )
}
