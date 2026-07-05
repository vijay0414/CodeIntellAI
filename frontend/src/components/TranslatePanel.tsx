import { useState } from 'react'
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer-continued'
import type { TranslateResult, Language } from '../types'
import { LANGUAGES } from '../types'
import { PanelSkeleton } from './Loader'
import { ErrorState }    from './ErrorState'

interface Props {
  result:         TranslateResult | null
  sourceLanguage: Language
  isLoading:      boolean
  error:          string | null
  onSubmit:       (targetLang: string) => void
  onRetry?:       () => void
}

export function TranslatePanel({ result, sourceLanguage, isLoading, error, onSubmit, onRetry }: Props) {
  const available = LANGUAGES.filter(l => l.value !== sourceLanguage)
  const [target, setTarget]   = useState(available[0]?.value ?? 'javascript')

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSubmit(target) }

  return (
    <div className="space-y-5 panel-enter">
      {/* selector */}
      <form onSubmit={handleSubmit} className="card flex flex-wrap items-end gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-slate-500 mb-1.5">From</p>
          <div className="px-3 py-2 bg-[#0b0d12] border border-[#1e2333] rounded-lg text-sm text-slate-400 font-mono capitalize">
            {sourceLanguage}
          </div>
        </div>
        <svg className="w-5 h-5 text-blue-500 mb-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
        </svg>
        <div>
          <p className="text-[11px] uppercase tracking-wider text-slate-500 mb-1.5">To</p>
          <select value={target} onChange={e => setTarget(e.target.value)}
            className="bg-[#0b0d12] border border-[#1e2333] focus:border-blue-500 text-slate-200
                       text-sm rounded-lg px-3 py-2 outline-none cursor-pointer transition-colors">
            {available.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </div>
        <button type="submit" disabled={isLoading}
          className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500
                     disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm
                     font-semibold rounded-lg transition-all active:scale-95">
          {isLoading
            ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg> Translating…</>
            : 'Translate →'}
        </button>
      </form>

      {isLoading && <PanelSkeleton />}
      {error && !isLoading && <ErrorState message={error} onRetry={onRetry} />}

      {result && !isLoading && (
        <div className="space-y-4">
          {/* warnings */}
          {result.warnings.length > 0 && (
            <div className="card border border-amber-500/20 bg-amber-500/5 space-y-2">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                </svg>
                <p className="text-sm font-semibold text-amber-300">Warnings</p>
              </div>
              <ul className="space-y-1">
                {result.warnings.map((w, i) => (
                  <li key={i} className="text-sm text-slate-400 flex gap-2">
                    <span className="text-amber-500 shrink-0">•</span>{w}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* translated code */}
          <div className="rounded-xl overflow-hidden border border-[#1e2333]">
            <div className="px-4 py-2.5 bg-[#0f1117] border-b border-[#1e2333] text-xs text-slate-500 flex gap-2">
              <span className="capitalize">{result.source_language}</span>
              <span>→</span>
              <span className="capitalize">{result.target_language}</span>
            </div>
            <ReactDiffViewer
              oldValue=''
              newValue={result.translated_code}
              splitView={false}
              compareMethod={DiffMethod.LINES}
              useDarkTheme={true}
              showDiffOnly={false}
              styles={{ variables: { dark: {
                diffViewerBackground: '#0b0d12',
                addedBackground: '#0d2010', addedColor: '#86efac',
                gutterBackground: '#111318', gutterColor: '#4b5563',
              }}}}
            />
          </div>

          {/* notes */}
          {result.translation_notes.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-slate-300 mb-3">Translation notes</p>
              <div className="space-y-2">
                {result.translation_notes.map((n, i) => (
                  <div key={i} className="card flex gap-3">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-blue-600/15 border border-blue-500/25
                                     text-blue-400 text-xs font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-slate-200">{n.concept}</p>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{n.explanation}</p>
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
