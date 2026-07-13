import { useMemo, useState } from 'react'
import { CodeEditor }              from './components/CodeEditor'
import { DebugPanel }              from './components/DebugPanel'
import { ExplanationPanel }        from './components/ExplanationPanel'
import { HistorySidebar }          from './components/HistorySidebar'
import { InterviewQuestionsPanel } from './components/InterviewQuestionsPanel'
import { OptimizePanel }           from './components/OptimizePanel'
import { ReviewPanel }             from './components/ReviewPanel'
import { TabNavigation }           from './components/TabNavigation'
import { TranslatePanel }          from './components/TranslatePanel'
import { BatchPanel }              from './components/BatchPanel'
import { ErrorState }              from './components/ErrorState'

import { useCodeReview }         from './hooks/useCodeReview'
import { useCodeExplain }        from './hooks/useCodeExplain'
import { useCodeOptimize }       from './hooks/useCodeOptimize'
import { useCodeDebug }          from './hooks/useCodeDebug'
import { useInterviewQuestions } from './hooks/useInterviewQuestions'
import { useCodeTranslate }      from './hooks/useCodeTranslate'
import { useBatchReview }        from './hooks/useBatchReview'

import { useAppStore } from './store/useAppStore'
import type { TabId }  from './types'

// Per-tab accent colours
const TAB_META: Record<TabId, { color: string; bg: string; border: string; icon: string }> = {
  review:    { color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/30',    icon: '🔍' },
  explain:   { color: 'text-white',      bg: 'bg-white/10',      border: 'border-white/20',      icon: '📖' },
  optimize:  { color: 'text-rose-300',   bg: 'bg-rose-500/10',   border: 'border-rose-500/30',   icon: '⚡' },
  debug:     { color: 'text-red-300',    bg: 'bg-red-900/20',    border: 'border-red-800/40',    icon: '🐛' },
  interview: { color: 'text-pink-300',   bg: 'bg-pink-500/10',   border: 'border-pink-500/30',   icon: '🎯' },
  translate: { color: 'text-slate-200',  bg: 'bg-slate-500/10',  border: 'border-slate-500/30',  icon: '🌐' },
  batch:     { color: 'text-orange-300', bg: 'bg-orange-500/10', border: 'border-orange-500/30', icon: '📦' },
}

export default function App() {
  const {
    code, language, mode,
    reviewResult, hasSubmitted, activeTab,
    setActiveTab, reset,
  } = useAppStore()

  const tabItems = useMemo<{ id: TabId; label: string }[]>(() => [
    { id: 'review',    label: 'Review'        },
    { id: 'explain',   label: 'Explain'       },
    { id: 'optimize',  label: 'Optimize'      },
    { id: 'debug',     label: 'Debug'         },
    { id: 'interview', label: 'Interview Prep' },
    { id: 'translate', label: 'Translate'     },
    { id: 'batch',     label: 'Batch Review'  },
  ], [])

  const [historyOpen,   setHistoryOpen]   = useState(false)
  const [debugTrace,    setDebugTrace]    = useState('')
  const [debugSample,   setDebugSample]   = useState('')
  const [interviewCount, setInterviewCount] = useState(5)

  const reviewMutation    = useCodeReview()
  const explainMutation   = useCodeExplain()
  const optimizeMutation  = useCodeOptimize()
  const debugMutation     = useCodeDebug()
  const interviewMutation = useInterviewQuestions()
  const translateMutation = useCodeTranslate()
  const batchMutation     = useBatchReview()

  const handleReview = () => {
    if (!code.trim()) return
    explainMutation.reset()
    optimizeMutation.reset()
    debugMutation.reset()
    interviewMutation.reset()
    translateMutation.reset()
    reviewMutation.mutate({ code, language, mode })
  }

  const handleExplain   = () => explainMutation.mutate({ code, language, mode })
  const handleOptimize  = () => optimizeMutation.mutate({ code, language })
  const handleInterview = () => interviewMutation.mutate({ code, language, count: interviewCount })
  const handleTranslate = (targetLang: string) =>
    translateMutation.mutate({ code, source_language: language, target_language: targetLang, mode })

  const handleBatch = (files: File[], batchMode: 'beginner' | 'advanced') => {
    const fd = new FormData()
    files.forEach(f => fd.append('files', f))
    fd.append('mode', batchMode)
    batchMutation.mutate(fd)
  }

  const handleDebugSubmit = () => {
    if (!debugTrace.trim()) return
    debugMutation.mutate({ code, language, error_trace: debugTrace.trim(), sample_input: debugSample.trim() || null })
  }

  const handleNewSession = () => {
    reset()
    reviewMutation.reset(); explainMutation.reset()
    optimizeMutation.reset(); debugMutation.reset()
    interviewMutation.reset(); translateMutation.reset()
    batchMutation.reset()
  }

  const renderPanel = () => {
    switch (activeTab) {
      case 'explain':
        return <ExplanationPanel result={explainMutation.data ?? null} isLoading={explainMutation.isPending}
          error={explainMutation.error?.message ?? null} onLoad={handleExplain} onRetry={handleExplain} />
      case 'optimize':
        return <OptimizePanel result={optimizeMutation.data ?? null} originalCode={code}
          isLoading={optimizeMutation.isPending} error={optimizeMutation.error?.message ?? null}
          onLoad={handleOptimize} onRetry={handleOptimize} />
      case 'debug':
        return <DebugPanel result={debugMutation.data ?? null} isLoading={debugMutation.isPending}
          error={debugMutation.error?.message ?? null} errorTrace={debugTrace} sampleInput={debugSample}
          onTraceChange={setDebugTrace} onSampleChange={setDebugSample} onSubmit={handleDebugSubmit} />
      case 'interview':
        return <InterviewQuestionsPanel result={interviewMutation.data ?? null}
          isLoading={interviewMutation.isPending} error={interviewMutation.error?.message ?? null}
          count={interviewCount} onCountChange={setInterviewCount} onLoad={handleInterview} />
      case 'translate':
        return <TranslatePanel result={translateMutation.data ?? null} sourceLanguage={language}
          sourceCode={code}
          isLoading={translateMutation.isPending} error={translateMutation.error?.message ?? null}
          onSubmit={handleTranslate} onRetry={() => translateMutation.reset()} />
      case 'batch':
        return <BatchPanel result={batchMutation.data ?? null}
          isLoading={batchMutation.isPending} error={batchMutation.error?.message ?? null}
          onSubmit={handleBatch} onRetry={() => batchMutation.reset()} />
      case 'review':
      default:
        return <ReviewPanel result={reviewResult} isLoading={reviewMutation.isPending}
          error={reviewMutation.error?.message ?? null} onRetry={handleReview} />
    }
  }

  const meta = TAB_META[activeTab]

  return (
    <div className="min-h-screen bg-[#0f0a0a] text-[#f1f0f0] font-sans">
      {/* ── Top gradient strip ── */}
      <div className="h-1 w-full bg-gradient-to-r from-red-900 via-red-600 to-rose-400" />

      <div className="mx-auto max-w-7xl flex flex-col gap-5 px-4 py-5 lg:px-6">

        {/* ── Header ── */}
        <header className="relative overflow-hidden rounded-2xl border border-[#2e1a1a]
                           bg-[#150d0d] px-6 py-6 shadow-2xl shadow-red-950/50">
          {/* bg glow */}
          <div className="pointer-events-none absolute -top-20 -right-20 w-72 h-72
                          rounded-full bg-red-700/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 w-48 h-48
                          rounded-full bg-rose-900/10 blur-2xl" />

          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              {/* Logo row */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-rose-500
                                flex items-center justify-center shadow-lg shadow-red-900/50">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
                  </svg>
                </div>
                <div>
                  <span className="text-lg font-bold text-white tracking-tight">CodeDoctor</span>
                  <span className="ml-2 text-[10px] font-semibold uppercase tracking-[0.2em]
                                   text-red-400 bg-red-500/10 border border-red-500/20
                                   px-2 py-0.5 rounded-full">AI Agent</span>
                </div>
              </div>
              <h1 className="text-2xl font-semibold text-white sm:text-3xl leading-snug">
                Review, debug, optimize &amp; translate code —
                <span className="text-red-400"> all in one place.</span>
              </h1>
              <p className="mt-2 text-sm text-[#a08080] leading-relaxed max-w-xl">
                Paste code, hit Review, then switch tabs for explanation, optimization,
                debugging, translation, and interview prep without losing context.
              </p>
            </div>

            {/* Stats pills */}
            <div className="flex flex-wrap gap-2 shrink-0">
              <div className="rounded-xl border border-[#2e1a1a] bg-[#1a1010] px-4 py-2.5 text-center">
                <div className="text-[10px] uppercase tracking-[0.2em] text-[#7a5050]">Mode</div>
                <div className="text-sm font-semibold text-white capitalize mt-0.5">{mode}</div>
              </div>
              <div className="rounded-xl border border-[#2e1a1a] bg-[#1a1010] px-4 py-2.5 text-center">
                <div className="text-[10px] uppercase tracking-[0.2em] text-[#7a5050]">Language</div>
                <div className="text-sm font-semibold text-white capitalize mt-0.5">{language}</div>
              </div>
              {hasSubmitted && reviewResult && (
                <div className={`rounded-xl border px-4 py-2.5 text-center
                  ${reviewResult.health_score >= 80 ? 'border-green-800/40 bg-green-900/10'
                  : reviewResult.health_score >= 50 ? 'border-amber-800/40 bg-amber-900/10'
                  : 'border-red-800/40 bg-red-900/10'}`}>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-[#7a5050]">Health</div>
                  <div className={`text-sm font-bold mt-0.5
                    ${reviewResult.health_score >= 80 ? 'text-green-400'
                    : reviewResult.health_score >= 50 ? 'text-amber-400'
                    : 'text-red-400'}`}>
                    {reviewResult.health_score}/100
                  </div>
                </div>
              )}
              {hasSubmitted && (
                <button onClick={handleNewSession}
                  className="rounded-xl border border-[#3d1515] bg-[#1a1010] px-4 py-2.5 text-center
                             hover:bg-[#2a1414] hover:border-red-700/50 transition-colors group">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-[#7a5050]">Session</div>
                  <div className="text-sm font-semibold text-red-400 mt-0.5 group-hover:text-red-300">
                    New ↺
                  </div>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* ── Main grid ── */}
        <div className={`grid gap-5 ${historyOpen ? 'xl:grid-cols-[1.6fr_0.75fr]' : ''}`}>

          {/* ── Editor + panels column ── */}
          <section className="rounded-2xl border border-[#2e1a1a] bg-[#150d0d]
                              shadow-xl shadow-red-950/30 overflow-hidden">

            {/* Editor wrapper */}
            <div className="p-4 sm:p-5 border-b border-[#2e1a1a]">
              <CodeEditor onSubmit={handleReview} isLoading={reviewMutation.isPending} />
            </div>

            {/* Pre-submit hint */}
            {!hasSubmitted && !reviewMutation.isPending && (
              <div className="m-4 sm:m-5 rounded-xl border border-dashed border-[#3d1515]
                              bg-[#120909] p-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20
                                  flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">How it works</p>
                    <p className="text-sm text-[#9a7070] mt-1 leading-relaxed">
                      Hit <span className="text-red-400 font-semibold">Review Code</span> to kick things off.
                      Results appear in the Review tab, then all other tabs unlock — each fetches
                      independently so a slow Optimize call never blocks your Explain tab.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Top-level error */}
            {reviewMutation.error && !hasSubmitted && (
              <div className="m-4 sm:m-5">
                <ErrorState message={reviewMutation.error.message} onRetry={handleReview} />
              </div>
            )}

            {/* Tabs + panel */}
            {hasSubmitted && (
              <div className="p-4 sm:p-5 space-y-4">
                <TabNavigation
                  tabs={tabItems}
                  activeTab={activeTab}
                  onSelect={setActiveTab}
                  onHistoryClick={() => setHistoryOpen(v => !v)}
                  historyOpen={historyOpen}
                />

                {/* Panel container with per-tab accent */}
                <div className={`rounded-xl border ${meta.border} ${meta.bg} p-4 sm:p-5 min-h-48`}>
                  {/* Tab header strip */}
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
                    <span className="text-base">{meta.icon}</span>
                    <span className={`text-xs font-bold uppercase tracking-[0.2em] ${meta.color}`}>
                      {tabItems.find(t => t.id === activeTab)?.label}
                    </span>
                    {activeTab !== 'review' && (
                      <span className="ml-auto text-[10px] text-[#6a4040] bg-[#1a0e0e]
                                       border border-[#2e1a1a] px-2 py-0.5 rounded-full">
                        current code
                      </span>
                    )}
                  </div>
                  {renderPanel()}
                </div>
              </div>
            )}
          </section>

          {/* ── History sidebar ── */}
          {historyOpen && (
            <aside className="space-y-4">
              <HistorySidebar isOpen={historyOpen} onToggle={() => setHistoryOpen(v => !v)} />

              {/* Signal overview */}
              <div className="rounded-2xl border border-[#2e1a1a] bg-[#150d0d] p-4
                              shadow-xl shadow-red-950/20">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-white">Signal overview</p>
                  <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase
                                   tracking-[0.2em] text-red-400 bg-red-500/10 border border-red-500/20
                                   px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                    Live
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  {[
                    { label: 'Issues found',   value: reviewResult ? String(reviewResult.issues.length) : '—',
                      color: reviewResult ? 'text-white' : 'text-[#5a3030]' },
                    { label: 'Health score',   value: reviewResult ? String(reviewResult.health_score) : '—',
                      color: reviewResult
                        ? reviewResult.health_score >= 80 ? 'text-green-400'
                        : reviewResult.health_score >= 50 ? 'text-amber-400'
                        : 'text-red-400' : 'text-[#5a3030]' },
                    { label: 'Critical issues', value: reviewResult
                        ? String(reviewResult.issues.filter(i => i.severity === 'critical').length)
                        : '—', color: 'text-red-400' },
                  ].map(row => (
                    <div key={row.label}
                      className="flex items-center justify-between rounded-lg border border-[#2e1a1a]
                                 bg-[#1a1010] px-3 py-2">
                      <span className="text-[#9a7070]">{row.label}</span>
                      <span className={`font-semibold ${row.color}`}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          )}

        </div>
      </div>
    </div>
  )
}
