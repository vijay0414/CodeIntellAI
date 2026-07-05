import { useAppStore } from '../store/useAppStore'
import type { HistoryEntry } from '../store/useAppStore'

function fmt(iso: string) {
  const d = new Date(iso)
  const diffMs = Date.now() - d.getTime()
  const mins  = Math.floor(diffMs / 60_000)
  const hours = Math.floor(diffMs / 3_600_000)
  if (mins  <  1) return 'just now'
  if (mins  < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function ScorePill({ score }: { score: number }) {
  // Semantic health colors — kept unchanged
  const cls =
    score >= 80 ? 'bg-emerald-500/15 text-emerald-400' :
    score >= 50 ? 'bg-amber-500/15  text-amber-400'    :
                  'bg-red-500/15    text-red-400'
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${cls}`}>
      {score}
    </span>
  )
}

interface Props {
  isOpen:   boolean
  onToggle: () => void
}

export function HistorySidebar({ isOpen, onToggle }: Props) {
  const { history, loadFromHistory, clearHistory } = useAppStore()

  return (
    <div className="rounded-3xl border border-[#2A2A2A] bg-[#111111]/90 p-4
                    shadow-[0_20px_70px_rgba(0,0,0,0.4)]">

      {/* ── header ── */}
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between text-left group"
      >
        <div>
          <p className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
            Review history
          </p>
          <p className="text-xs text-slate-500">
            {history.length > 0 ? `${history.length} this session` : 'No history yet'}
          </p>
        </div>
        <svg
          className={`h-4 w-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* ── body ── */}
      {isOpen && (
        <div className="mt-4 space-y-2">

          {/* empty state */}
          {history.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[#2A2A2A]
                            bg-[#0A0A0A] px-3 py-6 text-center">
              <p className="text-xs text-slate-600">
                Run a review to start building history.
              </p>
              <p className="text-[10px] text-slate-700 mt-1">
                Clears when you close this tab.
              </p>
            </div>
          )}

          {/* list */}
          {history.map((entry: HistoryEntry) => (
            <button
              key={entry.id}
              onClick={() => loadFromHistory(entry)}
              className="flex w-full items-start justify-between rounded-2xl border border-[#2A2A2A]
                         bg-[#161616] px-3 py-3 text-left transition-colors
                         hover:border-red-600/40 hover:bg-[#1A1A1A] group"
            >
              <div className="flex-1 min-w-0 pr-2">
                {/* language + time */}
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-red-400">
                    {entry.language}
                  </span>
                  <span className="text-[10px] text-slate-600">·</span>
                  <span className="text-[10px] text-slate-600">{fmt(entry.created_at)}</span>
                </div>
                {/* code preview */}
                <p className="text-xs text-slate-400 truncate font-mono leading-snug
                               group-hover:text-slate-300 transition-colors">
                  {entry.code.split('\n').find(l => l.trim()) ?? '(empty)'}
                </p>
                {/* summary snippet */}
                <p className="text-[10px] text-slate-600 truncate mt-0.5 leading-snug">
                  {entry.summary}
                </p>
              </div>
              <ScorePill score={entry.health_score} />
            </button>
          ))}

          {/* clear */}
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="w-full text-center text-[11px] text-slate-700 hover:text-red-400
                         transition-colors pt-1"
            >
              Clear history
            </button>
          )}
        </div>
      )}
    </div>
  )
}
