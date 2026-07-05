import { useState } from 'react'
import type { DebugResult } from '../types'
import { ErrorState } from './ErrorState'
import { PanelSkeleton } from './Loader'

interface Props {
  result: DebugResult | null
  isLoading: boolean
  error: string | null
  errorTrace: string
  sampleInput: string
  onTraceChange: (value: string) => void
  onSampleChange: (value: string) => void
  onSubmit: () => void
}

export function DebugPanel({ result, isLoading, error, errorTrace, sampleInput, onTraceChange, onSampleChange, onSubmit }: Props) {
  const [isFocused, setIsFocused] = useState(false)

  if (isLoading) return <PanelSkeleton />
  if (error) return <ErrorState message={error} />

  return (
    <div className="space-y-4 panel-enter">
      <div className="rounded-2xl border border-[#2A2A2A] bg-[#161616] p-4">
        <p className="text-sm font-semibold text-slate-200">Trace the failure</p>
        <p className="mt-1 text-sm text-slate-500">Paste the error output and a sample input if you want a more precise root-cause analysis.</p>

        <div className="mt-4 space-y-3">
          <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
            Error trace
            <textarea
              rows={6}
              value={errorTrace}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onChange={(e) => onTraceChange(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-[#2A2A2A] bg-[#0A0A0A] px-3 py-3 text-sm text-slate-200 outline-none transition focus:border-red-600"
              placeholder="TypeScript error: Cannot read properties of undefined..."
            />
          </label>

          <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
            Sample input
            <textarea
              rows={3}
              value={sampleInput}
              onChange={(e) => onSampleChange(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-[#2A2A2A] bg-[#0A0A0A] px-3 py-3 text-sm text-slate-200 outline-none transition focus:border-red-600"
              placeholder="Optional input that triggers the bug"
            />
          </label>

          <button
            onClick={onSubmit}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Inspect failure
          </button>
        </div>
      </div>

      {result ? (
        <div className="space-y-3">
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
            <p className="text-[11px] uppercase tracking-[0.25em] text-red-300">Root cause</p>
            <p className="mt-2 text-sm text-slate-200">{result.root_cause}</p>
          </div>
          <div className="rounded-2xl border border-[#2A2A2A] bg-[#161616] p-4">
            <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500">Fix</p>
            <pre className="mt-2 overflow-x-auto whitespace-pre-wrap text-sm text-slate-300">{result.fixed_code}</pre>
          </div>
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-200">
            <p className="font-semibold">Prevention tip</p>
            <p className="mt-1">{result.prevention_tip}</p>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[#2A2A2A] bg-[#0A0A0A] p-4 text-sm text-slate-500">
          {isFocused ? 'The trace is ready — inspect it and surface the likely failure path.' : 'No debug analysis yet. Send a trace and inspect the suggested fix.'}
        </div>
      )}
    </div>
  )
}
