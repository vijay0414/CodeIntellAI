import type { InterviewResult } from '../types'
import { ErrorState }    from './ErrorState'
import { PanelSkeleton } from './Loader'

interface Props {
  result: InterviewResult | null; isLoading: boolean; error: string | null
  count: number; onCountChange: (n: number) => void; onLoad: () => void
}

const DIFF_STYLES = {
  hard:   'bg-red-500/20 text-red-300 border border-red-500/30',
  medium: 'bg-amber-500/15 text-amber-300 border border-amber-500/25',
  easy:   'bg-green-500/15 text-green-300 border border-green-500/25',
}

export function InterviewQuestionsPanel({ result, isLoading, error, count, onCountChange, onLoad }: Props) {
  if (isLoading) return <PanelSkeleton />
  if (error)     return <ErrorState message={error} />

  if (!result) return (
    <div className="space-y-4 panel-enter">
      <div className="rounded-xl border border-[#3d1515] bg-[#150909] p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">🎯</span>
          <p className="text-sm font-semibold text-white">Interview prep</p>
        </div>
        <p className="text-sm text-[#9a7070] mb-4">
          Generate a focused set of questions based on the algorithms and patterns in your code.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-bold uppercase
                            tracking-[0.2em] text-[#7a5050]">
            Questions
            <select value={count} onChange={e => onCountChange(Number(e.target.value))}
              className="rounded-lg border border-[#2e1a1a] bg-[#0f0808] px-3 py-2
                         text-sm text-white outline-none focus:border-red-700/60 font-normal normal-case">
              {[5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
          <button onClick={onLoad}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold
                       rounded-lg transition-all shadow-lg shadow-red-900/30 active:scale-95">
            Generate questions
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-4 panel-enter">
      {/* Topics detected — white card */}
      {result.topics_detected?.length > 0 && (
        <div className="rounded-xl border border-white/20 bg-[#fafafa] p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#7a3030] mb-3">
            Topics detected
          </p>
          <div className="flex flex-wrap gap-2">
            {result.topics_detected.map((t, i) => (
              <span key={i} className="text-xs font-medium px-3 py-1 rounded-full
                                       bg-red-50 text-red-700 border border-red-200">
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Questions */}
      <div className="space-y-3">
        {result.questions.map((q, i) => (
          <div key={i} className="rounded-xl border border-[#2e1a1a] bg-[#1a1010] p-4">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-full bg-red-600/15 border border-red-500/25
                               text-red-400 text-xs font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <span className={`badge ${DIFF_STYLES[q.difficulty]}`}>{q.difficulty}</span>
            </div>
            <p className="text-sm font-medium text-white leading-relaxed">{q.question}</p>
            <div className="mt-3 pt-3 border-t border-[#2e1a1a]">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#5a3030] mb-1">Answer hint</p>
              <p className="text-sm text-[#9a7070] leading-relaxed">{q.answer_hint}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
