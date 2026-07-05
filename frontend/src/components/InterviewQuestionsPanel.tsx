import type { InterviewResult } from '../types'
import { ErrorState } from './ErrorState'
import { PanelSkeleton } from './Loader'

interface Props {
  result: InterviewResult | null
  isLoading: boolean
  error: string | null
  count: number
  onCountChange: (count: number) => void
  onLoad: () => void
}

export function InterviewQuestionsPanel({ result, isLoading, error, count, onCountChange, onLoad }: Props) {
  if (isLoading) return <PanelSkeleton />
  if (error) return <ErrorState message={error} />

  if (!result) {
    return (
      <div className="space-y-4 panel-enter">
        <div className="rounded-2xl border border-[#2A2A2A] bg-[#161616] p-4">
          <p className="text-sm font-semibold text-slate-200">Interview prep</p>
          <p className="mt-1 text-sm text-slate-500">Generate a focused set of questions around the code structure and likely interview topics.</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <label className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
              Question count
              <select value={count} onChange={(e) => onCountChange(Number(e.target.value))}
                className="ml-2 rounded-lg border border-[#2A2A2A] bg-[#0A0A0A] px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-red-600">
                <option value={5}>5</option>
                <option value={6}>6</option>
                <option value={7}>7</option>
                <option value={8}>8</option>
                <option value={9}>9</option>
                <option value={10}>10</option>
              </select>
            </label>
            <button onClick={onLoad}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700">
              Generate questions
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3 panel-enter">
      {result.questions.map((q, index) => (
        <div key={index} className="rounded-2xl border border-[#2A2A2A] bg-[#161616] p-4">
          <div className="flex flex-wrap items-center gap-2">
            {/* difficulty badges are semantic — kept unchanged */}
            <span className={`badge ${
              q.difficulty === 'hard'   ? 'bg-red-500/15 text-red-400 border border-red-500/25' :
              q.difficulty === 'medium' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25' :
                                          'bg-green-500/15 text-green-400 border border-green-500/25'
            }`}>
              {q.difficulty}
            </span>
            <span className="text-[11px] uppercase tracking-[0.25em] text-slate-500">Prep prompt</span>
          </div>
          <p className="mt-3 text-sm font-medium text-slate-200">{q.question}</p>
          <p className="mt-2 text-sm text-slate-500">{q.answer_hint}</p>
        </div>
      ))}
    </div>
  )
}
