import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer-continued'
import type { OptimizeResult } from '../types'
import { PanelSkeleton } from './Loader'
import { ErrorState }    from './ErrorState'

interface Props {
  result: OptimizeResult | null
  originalCode: string
  isLoading: boolean
  error: string | null
  onLoad: () => void
  onRetry?: () => void
}

// Normalise code: ensure LLM-returned code with escaped \n is real newlines
function normalise(code: string): string {
  return code.replace(/\\n/g, '\n').replace(/\\t/g, '\t')
}

export function OptimizePanel({ result, originalCode, isLoading, error, onLoad, onRetry }: Props) {
  if (isLoading) return <PanelSkeleton />
  if (error)     return <ErrorState message={error} onRetry={onRetry} />

  if (!result) return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center panel-enter">
      <div className="w-14 h-14 rounded-2xl bg-[#161a24] border border-[#1e2333] flex items-center justify-center">
        <svg className="w-7 h-7 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z"/>
        </svg>
      </div>
      <div>
        <p className="text-slate-400 font-medium">Optimize this code</p>
        <p className="text-slate-600 text-sm mt-1">Get a diff + complexity analysis</p>
      </div>
      <button onClick={onLoad}
        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold
                   rounded-lg transition-all shadow-lg shadow-blue-900/25 active:scale-95">
        Optimize Code
      </button>
    </div>
  )

  const noChange =
    result.changes.length === 1 &&
    result.changes[0].what.toLowerCase().includes('no changes')

  const oldCode = normalise(originalCode)
  const newCode = normalise(result.optimized_code)

  return (
    <div className="space-y-5 panel-enter">

      {/* ── Complexity bar ── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-3 rounded-xl border border-[#1e2333] bg-[#0f1117] px-5 py-3">
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Before</p>
            <code className="text-amber-400 font-mono text-sm font-semibold">
              {result.complexity_before}
            </code>
          </div>
          <svg className="w-5 h-5 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
          </svg>
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">After</p>
            <code className="text-green-400 font-mono text-sm font-semibold">
              {result.complexity_after}
            </code>
          </div>
        </div>
        {noChange && (
          <span className="text-xs text-green-400 bg-green-500/10 border border-green-500/20
                           px-3 py-1.5 rounded-full">
            ✓ Already optimal
          </span>
        )}
      </div>

      {noChange ? null : (
        <>
          {/* ── Side-by-side code panels ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Original */}
            <div className="flex flex-col rounded-xl border border-[#1e2333] overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-[#0f1117] border-b border-[#1e2333]">
                <span className="w-2 h-2 rounded-full bg-red-500/70" />
                <span className="text-xs font-medium text-slate-400">Original</span>
                <span className="ml-auto text-[10px] text-amber-400 font-mono bg-amber-500/10
                                 border border-amber-500/20 px-2 py-0.5 rounded-full">
                  {result.complexity_before}
                </span>
              </div>
              <pre className="flex-1 bg-[#0b0d12] p-4 text-[12px] font-mono text-slate-400
                              overflow-x-auto whitespace-pre leading-relaxed">
                {oldCode}
              </pre>
            </div>

            {/* Optimized */}
            <div className="flex flex-col rounded-xl border border-[#1c3326] overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-[#0a130f] border-b border-[#1c3326]">
                <span className="w-2 h-2 rounded-full bg-green-500/70" />
                <span className="text-xs font-medium text-slate-400">Optimized</span>
                <span className="ml-auto text-[10px] text-green-400 font-mono bg-green-500/10
                                 border border-green-500/20 px-2 py-0.5 rounded-full">
                  {result.complexity_after}
                </span>
              </div>
              <pre className="flex-1 bg-[#080e0a] p-4 text-[12px] font-mono text-slate-300
                              overflow-x-auto whitespace-pre leading-relaxed">
                {newCode}
              </pre>
            </div>
          </div>

          {/* ── Unified diff (collapsible toggle) ── */}
          <details className="group rounded-xl border border-[#1e2333] overflow-hidden">
            <summary className="flex items-center gap-2 px-4 py-3 bg-[#0f1117] cursor-pointer
                                text-xs text-slate-500 hover:text-slate-300 transition-colors select-none
                                list-none">
              <svg className="w-3.5 h-3.5 transition-transform group-open:rotate-90"
                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
              </svg>
              Show unified diff
            </summary>
            <div className="overflow-x-auto text-[12px] leading-5">
              <ReactDiffViewer
                oldValue={oldCode}
                newValue={newCode}
                splitView={false}
                compareMethod={DiffMethod.LINES}
                useDarkTheme={true}
                styles={{
                  variables: {
                    dark: {
                      diffViewerBackground:     '#0b0d12',
                      addedBackground:          '#0d2010',
                      addedColor:               '#86efac',
                      removedBackground:        '#1f0808',
                      removedColor:             '#fca5a5',
                      wordAddedBackground:      '#166534',
                      wordRemovedBackground:    '#7f1d1d',
                      gutterBackground:         '#111318',
                      gutterColor:              '#4b5563',
                      codeFoldBackground:       '#0b0d12',
                      codeFoldGutterBackground: '#0b0d12',
                    },
                  },
                  line:          { padding: '2px 8px' },
                  gutter:        { padding: '0 8px', minWidth: '36px' },
                  diffContainer: { overflowX: 'auto' },
                  wordDiff:      { padding: '1px 0' },
                }}
              />
            </div>
          </details>

          {/* ── What changed ── */}
          <div>
            <p className="text-sm font-semibold text-slate-300 mb-3">What changed</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {result.changes.map((c, i) => (
                <div key={i} className="flex gap-3 rounded-xl border border-[#1e2333] bg-[#0f1117] p-3">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-blue-600/15 border border-blue-500/25
                                   text-blue-400 text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-200">{c.what}</p>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{c.why}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

    </div>
  )
}
