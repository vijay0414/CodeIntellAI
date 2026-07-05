import { useState } from 'react'
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer-continued'
import type { TranslateResult, Language } from '../types'
import { LANGUAGES } from '../types'
import { PanelSkeleton } from './Loader'
import { ErrorState }    from './ErrorState'

interface Props {
  result: TranslateResult | null; sourceLanguage: Language
  isLoading: boolean; error: string | null
  onSubmit: (targetLang: string) => void; onRetry?: () => void
}

export function TranslatePanel({ result, sourceLanguage, isLoading, error, onSubmit, onRetry }: Props) {
  const available = LANGUAGES.filter(l => l.value !== sourceLanguage)
  const [target, setTarget] = useState(available[0]?.value ?? 'javascript')

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSubmit(target) }

  return (
    <div className="space-y-4 panel-enter">
      {/* Selector form */}
      <form onSubmit={handleSubmit}
        className="rounded-xl border border-[#2e1a1a] bg-[#1a1010] p-4 flex flex-wrap items-end gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-[#7a5050] mb-1.5">From</p>
          <div className="px-3 py-2 bg-[#0f0808] border border-[#2e1a1a] rounded-lg
                          text-sm text-[#9a7070] font-mono capitalize">
            {sourceLanguage}
          </div>
        </div>

        <svg className="w-5 h-5 text-red-500 mb-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
        </svg>

        <div>
          <p className="text-[11px] uppercase tracking-wider text-[#7a5050] mb-1.5">To</p>
          <select value={target} onChange={e => setTarget(e.target.value as Language)}
            className="bg-[#0f0808] border border-[#2e1a1a] focus:border-red-700/60 text-white
                       text-sm rounded-lg px-3 py-2 outline-none cursor-pointer transition-colors">
            {available.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </div>

        <button type="submit" disabled={isLoading}
          className="flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-500
                     disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm
                     font-semibold rounded-lg transition-all shadow-lg shadow-red-900/30 active:scale-95">
          {isLoading
            ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>Translating…</>
            : 'Translate →'}
        </button>
      </form>

      {isLoading && <PanelSkeleton />}
      {error && !isLoading && <ErrorState message={error} onRetry={onRetry} />}

      {result && !isLoading && (
        <div className="space-y-4">
          {/* Warnings */}
          {result.warnings.length > 0 && (
            <div className="rounded-xl border border-amber-800/30 bg-amber-900/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                </svg>
                <p className="text-sm font-semibold text-amber-300">Warnings</p>
              </div>
              <ul className="space-y-1">
                {result.warnings.map((w, i) => (
                  <li key={i} className="text-sm text-[#c0a080] flex gap-2">
                    <span className="text-amber-500 shrink-0">•</span>{w}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Side-by-side: source (dark) / translated (white) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className="flex flex-col rounded-xl border border-[#2e1a1a] overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-[#150909] border-b border-[#2e1a1a]">
                <span className="w-2 h-2 rounded-full bg-red-500/70" />
                <span className="text-xs font-semibold text-[#9a7070] capitalize">
                  {result.source_language}
                </span>
              </div>
              <div className="overflow-x-auto text-[12px] leading-5 flex-1">
                <ReactDiffViewer oldValue='' newValue={result.translated_code}
                  splitView={false} compareMethod={DiffMethod.LINES}
                  useDarkTheme={true} showDiffOnly={false}
                  styles={{ variables: { dark: {
                    diffViewerBackground: '#0f0808',
                    addedBackground: '#0f0808', addedColor: '#9a7070',
                    gutterBackground: '#150909', gutterColor: '#4a2a2a',
                  }},
                  line:          { padding: '2px 8px' },
                  gutter:        { padding: '0 8px', minWidth: '36px' },
                  diffContainer: { overflowX: 'auto' },
                }} />
              </div>
            </div>

            <div className="flex flex-col rounded-xl border border-white/20 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-[#f0f0f0] border-b border-[#e0e0e0]">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs font-semibold text-[#3a3a3a] capitalize">
                  {result.target_language}
                </span>
              </div>
              <pre className="flex-1 bg-[#fafafa] p-4 text-[12px] font-mono text-[#1a1a1a]
                              overflow-x-auto whitespace-pre leading-relaxed">
                {result.translated_code}
              </pre>
            </div>
          </div>

          {/* Translation notes */}
          {result.translation_notes.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-white mb-3">Translation notes</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {result.translation_notes.map((n, i) => (
                  <div key={i} className="flex gap-3 rounded-xl border border-[#2e1a1a]
                                          bg-[#1a1010] p-3">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-red-600/15
                                     border border-red-500/25 text-red-400 text-xs font-bold
                                     flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-white">{n.concept}</p>
                      <p className="text-xs text-[#7a5050] mt-1 leading-relaxed">{n.explanation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
