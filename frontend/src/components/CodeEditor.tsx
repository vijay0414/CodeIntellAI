import Editor from '@monaco-editor/react'
import { LANGUAGES } from '../types'
import type { Language, Mode } from '../types'
import { useAppStore } from '../store/useAppStore'

interface Props { onSubmit: () => void; isLoading: boolean }

export function CodeEditor({ onSubmit, isLoading }: Props) {
  const { code, language, mode, setCode, setLanguage, setMode } = useAppStore()
  const monacoLang = LANGUAGES.find(l => l.value === language)?.monaco ?? 'plaintext'

  return (
    <div className="flex flex-col gap-3">
      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-2">

        {/* Language picker */}
        <div className="relative">
          <select
            value={language}
            onChange={e => setLanguage(e.target.value as Language)}
            className="appearance-none bg-[#161616] border border-[#2A2A2A] text-slate-200
                       text-sm rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:border-red-600
                       cursor-pointer transition-colors hover:border-[#3A3A3A]"
          >
            {LANGUAGES.map(l => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
          <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
          </svg>
        </div>

        {/* Mode toggle */}
        <div className="flex bg-[#161616] border border-[#2A2A2A] rounded-lg p-0.5 gap-0.5">
          {(['beginner', 'advanced'] as Mode[]).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1.5 text-xs rounded-md font-medium capitalize transition-all ${
                mode === m
                  ? 'bg-red-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* CTA */}
        <button
          onClick={onSubmit}
          disabled={isLoading || !code.trim()}
          className="flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-700
                     disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm
                     font-semibold rounded-lg transition-all shadow-lg shadow-red-900/25
                     active:scale-95"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Analysing…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2
                     M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
              Review Code
            </>
          )}
        </button>
      </div>

      {/* ── Monaco ── */}
      <div className="rounded-xl overflow-hidden border border-[#2A2A2A] shadow-2xl">
        {/* Fake traffic-light bar — keep original macOS colors (UI convention) */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 bg-[#111111] border-b border-[#2A2A2A]">
          <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
          <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
          <span className="ml-3 text-xs text-slate-600 font-mono">
            {LANGUAGES.find(l => l.value === language)?.label}
          </span>
        </div>

        <Editor
          height="400px"
          language={monacoLang}
          value={code}
          onChange={v => setCode(v ?? '')}
          theme="vs-dark"
          options={{
            fontSize:             14,
            fontFamily:           '"JetBrains Mono", "Fira Code", monospace',
            fontLigatures:        true,
            minimap:              { enabled: false },
            scrollBeyondLastLine: false,
            lineNumbers:          'on',
            glyphMargin:          false,
            folding:              true,
            wordWrap:             'on',
            padding:              { top: 16, bottom: 16 },
            renderLineHighlight:  'line',
            smoothScrolling:      true,
            cursorBlinking:       'smooth',
            tabSize:              2,
          }}
        />
      </div>
    </div>
  )
}
