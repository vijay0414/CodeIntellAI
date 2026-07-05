import { useState } from 'react'
import type { ExplainResult, WalkthroughStep } from '../types'
import { PanelSkeleton } from './Loader'
import { ErrorState }    from './ErrorState'

function AccordionStep({ step, index }: { step: WalkthroughStep; index: number }) {
  const [open, setOpen] = useState(index === 0)
  return (
    <div className="rounded-xl border border-[#2e1a1a] bg-[#1a1010] overflow-hidden">
      <button className="w-full flex items-center gap-3 px-4 py-3.5 text-left
                         hover:bg-[#2a1414] transition-colors"
        onClick={() => setOpen(v => !v)}>
        <span className="shrink-0 w-6 h-6 rounded-full bg-red-600/15 border border-red-500/25
                         text-red-400 text-xs font-bold flex items-center justify-center">
          {index + 1}
        </span>
        <span className="text-sm font-medium text-white flex-1">{step.section}</span>
        <svg className={`w-4 h-4 text-[#5a3030] transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
        </svg>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-2 border-t border-[#2e1a1a] panel-enter">
          <p className="text-sm text-[#c0a0a0] leading-relaxed">{step.explanation}</p>
        </div>
      )}
    </div>
  )
}

interface Props {
  result: ExplainResult | null; isLoading: boolean
  error: string | null; onLoad: () => void; onRetry?: () => void
}

export function ExplanationPanel({ result, isLoading, error, onLoad, onRetry }: Props) {
  if (isLoading) return <PanelSkeleton />
  if (error)     return <ErrorState message={error} onRetry={onRetry} />

  if (!result) return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center panel-enter">
      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10
                      flex items-center justify-center">
        <svg className="w-7 h-7 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477
               5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0
               3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
        </svg>
      </div>
      <div>
        <p className="text-[#c0a0a0] font-medium">Explain this code</p>
        <p className="text-[#6a4040] text-sm mt-1">Get a section-by-section walkthrough</p>
      </div>
      <button onClick={onLoad}
        className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold
                   rounded-lg transition-all shadow-lg shadow-red-900/30 active:scale-95">
        Explain Code
      </button>
    </div>
  )

  return (
    <div className="space-y-4 panel-enter">
      {/* Overview card — white accent */}
      <div className="rounded-xl border-l-2 border-l-white/60 border border-[#2e1a1a]
                      bg-[#fafafa] p-4">
        <p className="text-[11px] uppercase tracking-wider text-[#7a5050] mb-2">Overview</p>
        <p className="text-sm text-[#1a1a1a] leading-relaxed">{result.overview}</p>
      </div>

      <div>
        <p className="text-sm font-semibold text-white mb-3">
          Walkthrough
          <span className="ml-2 text-xs text-[#5a3030]">({result.walkthrough.length} sections)</span>
        </p>
        <div className="space-y-2">
          {result.walkthrough.map((s, i) => <AccordionStep key={i} step={s} index={i} />)}
        </div>
      </div>
    </div>
  )
}
