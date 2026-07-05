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

function normalise(code: string): string {
  return code.replace(/\\n/g, '\n').replace(/\\t/g, '\t')
}

export function OptimizePanel({ result, originalCode, isLoading, error, onLoad, onRetry }: Props) {
  if (isLoading) return <PanelSkeleton />
  if (error)     return <ErrorState message={error} onRetry={onRetry} />

  if (!result) return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center panel-enter">
      <div className="w-14 h-14 rounded-2xl bg-[#161616] border border-[#2A2A2A] flex items-center justify-center">
        <svg className="w-7 h-7 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z"/>
        </svg>
      </div>
      <div>
        <p className="text-slate-400 font-medium">Optimize this code</p>
        <p className="text-slate-600 text-sm mt-1">Get a diff + complexity analysis</p>
      </div>
      <button onClick={onLoad}
        className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold
                   rounded-lg transition-all shadow-lg shadow-red-900/25 active:scale-95">
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

      {/* ── Complexity chip ── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="card flex items-center gap-4 py-3 px-5 w-fit">
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Before</p>
            <code className="text-amber-400 font-mono text-sm font-semibold">
              {result.complexity_before}
            </code>
          </div>
          <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

      {/* ── Diff ── */}
      {!noChange && (
        <div className="rounded-xl overflow-hidden border border-[#2A2A2A]">
          <div className="flex items-center gap-4 px-4 py-2.5 bg-[#111111] border-b border-[#2A2A2A]">
            <span className="text-xs text-slate-500">Before</span>
            <span className="text-slate-700">→</span>
            <span className="text-xs text-slate-500">After</span>
          </div>
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
                    diffViewerBackground:  '#0A0A0A',
                    addedBackground:       '#0d2010',
                    addedColor:            '#86efac',
                    removedBackground:     '#1f0808',
                    removedColor:          '#fca5a5',
                    wordAddedBackground:   '#166534',
                    wordRemovedBackground: '#7f1d1d',
                    gutterBackground:      '#111111',
                    gutterColor:           '#4b5563',
                    codeFoldBackground:    '#0A0A0A',
                    codeFoldGutterBackground: '#0A0A0A',
                  },
                },
                line:            { padding: '2px 8px' },
                gutter:          { padding: '0 8px', minWidth: '36px' },
                diffContainer:   { overflowX: 'auto' },
                wordDiff:        { padding: '1px 0' },
              }}
            />
          </div>
        </div>
      )}

      {/* ── Optimized code block ── */}
      {!noChange && (
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Optimized code</p>
          <pre className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl p-4 text-xs font-mono
                          text-slate-300 overflow-x-auto whitespace-pre leading-relaxed">
            {newCode}
          </pre>
        </div>
      )}

      {/* ── Changes list ── */}
      <div>
        <p className="text-sm font-semibold text-slate-300 mb-3">What changed</p>
        <div className="space-y-2">
          {result.changes.map((c, i) => (
            <div key={i} className="card flex gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-red-600/15 border border-red-600/25
                               text-red-400 text-xs font-bold flex items-center justify-center mt-0.5">
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

    </div>
  )
}
