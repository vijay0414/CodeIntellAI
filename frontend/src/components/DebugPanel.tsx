import type { DebugResult } from '../types'
import { ErrorState }    from './ErrorState'
import { PanelSkeleton } from './Loader'

interface Props {
  result: DebugResult | null; isLoading: boolean; error: string | null
  errorTrace: string; sampleInput: string
  onTraceChange: (v: string) => void; onSampleChange: (v: string) => void; onSubmit: () => void
}

export function DebugPanel({ result, isLoading, error, errorTrace, sampleInput, onTraceChange, onSampleChange, onSubmit }: Props) {
  if (isLoading) return <PanelSkeleton />
  if (error)     return <ErrorState message={error} />

  return (
    <div className="space-y-4 panel-enter">
      {/* Input form */}
      <div className="rounded-xl border border-[#3d1515] bg-[#150909] p-4">
        <p className="text-sm font-semibold text-white">Trace the failure</p>
        <p className="mt-1 text-sm text-[#9a7070]">
          Paste the error output and an optional sample input for a precise root-cause analysis.
        </p>

        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#7a5050]">
              Error trace
            </span>
            <textarea rows={5} value={errorTrace} onChange={e => onTraceChange(e.target.value)}
              className="mt-2 w-full rounded-xl border border-[#2e1a1a] bg-[#0f0808]
                         px-3 py-3 text-sm text-[#e8d8d8] font-mono outline-none
                         transition focus:border-red-700/60 placeholder:text-[#4a2a2a]"
              placeholder="TypeError: Cannot read properties of undefined…" />
          </label>

          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#7a5050]">
              Sample input <span className="text-[#4a2a2a] normal-case font-normal">(optional)</span>
            </span>
            <textarea rows={2} value={sampleInput} onChange={e => onSampleChange(e.target.value)}
              className="mt-2 w-full rounded-xl border border-[#2e1a1a] bg-[#0f0808]
                         px-3 py-3 text-sm text-[#e8d8d8] font-mono outline-none
                         transition focus:border-red-700/60 placeholder:text-[#4a2a2a]"
              placeholder="Input that triggers the bug" />
          </label>

          <button onClick={onSubmit} disabled={!errorTrace.trim()}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500
                       disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm
                       font-semibold rounded-lg transition-all shadow-lg shadow-red-900/30 active:scale-95">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            Inspect failure
          </button>
        </div>
      </div>

      {result ? (
        <div className="space-y-3">
          {/* Root cause — white card */}
          <div className="rounded-xl border border-white/20 bg-[#fafafa] p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-red-600 mb-2">
              Root cause
            </p>
            <p className="text-sm text-[#1a1a1a] leading-relaxed">{result.root_cause}</p>
            {result.error_location && (
              <p className="mt-2 text-xs text-[#5a5a5a]">
                <span className="font-semibold">Location:</span> {result.error_location}
              </p>
            )}
          </div>

          {/* Fix */}
          <div className="rounded-xl border border-[#2e1a1a] bg-[#1a1010] p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#7a5050] mb-2">
              Fix
            </p>
            <pre className="overflow-x-auto whitespace-pre-wrap text-sm text-[#e8d8d8] font-mono
                            leading-relaxed">{result.fixed_code}</pre>
          </div>

          {/* Explanation */}
          {result.explanation && (
            <div className="rounded-xl border border-[#2e1a1a] bg-[#1a1010] p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#7a5050] mb-2">
                Explanation
              </p>
              <p className="text-sm text-[#c0a0a0] leading-relaxed">{result.explanation}</p>
            </div>
          )}

          {/* Prevention tip — red accent */}
          <div className="rounded-xl border border-red-800/30 bg-red-900/10 p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-red-400 mb-2">
              Prevention tip
            </p>
            <p className="text-sm text-[#e8c0c0] leading-relaxed">{result.prevention_tip}</p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-[#3d1515] bg-[#120909] p-5
                        text-sm text-[#5a3030] text-center">
          Paste an error trace above and hit Inspect failure
        </div>
      )}
    </div>
  )
}
