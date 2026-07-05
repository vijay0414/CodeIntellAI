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
import { ErrorState }              from './components/ErrorState'

import { useCodeReview }        from './hooks/useCodeReview'
import { useCodeExplain }       from './hooks/useCodeExplain'
import { useCodeOptimize }      from './hooks/useCodeOptimize'
import { useCodeDebug }         from './hooks/useCodeDebug'
import { useInterviewQuestions } from './hooks/useInterviewQuestions'
import { useCodeTranslate }     from './hooks/useCodeTranslate'

import { useAppStore } from './store/useAppStore'
import type { TabId }  from './types'

export default function App() {
  const {
    code, language, mode,
    reviewResult, hasSubmitted, activeTab,
    setActiveTab, reset,
  } = useAppStore()

  // ── tab list ────────────────────────────────────────────────────────────────
  const tabItems = useMemo<{ id: TabId; label: string }[]>(() => [
    { id: 'review',    label: 'Review'        },
    { id: 'explain',   label: 'Explain'       },
    { id: 'optimize',  label: 'Optimize'      },
    { id: 'debug',     label: 'Debug'         },
    { id: 'interview', label: 'Interview Prep' },
    { id: 'translate', label: 'Translate'     },
  ], [])

  // ── history sidebar — hidden by default, shown only when History tab clicked ──
  const [historyOpen, setHistoryOpen] = useState(false)

  // ── debug local state ────────────────────────────────────────────────────────
  const [debugTrace,  setDebugTrace]  = useState('')
  const [debugSample, setDebugSample] = useState('')

  // ── interview count ──────────────────────────────────────────────────────────
  const [interviewCount, setInterviewCount] = useState(5)

  // ── mutations ────────────────────────────────────────────────────────────────
  const reviewMutation    = useCodeReview()
  const explainMutation   = useCodeExplain()
  const optimizeMutation  = useCodeOptimize()
  const debugMutation     = useCodeDebug()
  const interviewMutation = useInterviewQuestions()
  const translateMutation = useCodeTranslate()

  // ── handlers ─────────────────────────────────────────────────────────────────
  const handleReview = () => {
    if (!code.trim()) return
    // Reset all other tab results so stale data doesn't show after re-review
    explainMutation.reset()
    optimizeMutation.reset()
    debugMutation.reset()
    interviewMutation.reset()
    translateMutation.reset()
    reviewMutation.mutate({ code, language, mode })
  }

  const handleExplain = () =>
    explainMutation.mutate({ code, language, mode })

  const handleOptimize = () =>
    optimizeMutation.mutate({ code, language })

  const handleDebugSubmit = () => {
    if (!debugTrace.trim()) return
    debugMutation.mutate({
      code, language,
      error_trace:  debugTrace.trim(),
      sample_input: debugSample.trim() || null,
    })
  }

  const handleInterview = () =>
    interviewMutation.mutate({ code, language, count: interviewCount })

  const handleTranslate = (targetLang: string) =>
    translateMutation.mutate({ code, source_language: language, target_language: targetLang, mode })

  const handleNewSession = () => {
    reset()
    reviewMutation.reset()
    explainMutation.reset()
    optimizeMutation.reset()
    debugMutation.reset()
    interviewMutation.reset()
    translateMutation.reset()
  }

  // ── panel renderer ───────────────────────────────────────────────────────────
  const renderPanel = () => {
    switch (activeTab) {
      case 'explain':
        return (
          <ExplanationPanel
            result={explainMutation.data ?? null}
            isLoading={explainMutation.isPending}
            error={explainMutation.error?.message ?? null}
            onLoad={handleExplain}
            onRetry={handleExplain}
          />
        )
      case 'optimize':
        return (
          <OptimizePanel
            result={optimizeMutation.data ?? null}
            originalCode={code}
            isLoading={optimizeMutation.isPending}
            error={optimizeMutation.error?.message ?? null}
            onLoad={handleOptimize}
            onRetry={handleOptimize}
          />
        )
      case 'debug':
        return (
          <DebugPanel
            result={debugMutation.data ?? null}
            isLoading={debugMutation.isPending}
            error={debugMutation.error?.message ?? null}
            errorTrace={debugTrace}
            sampleInput={debugSample}
            onTraceChange={setDebugTrace}
            onSampleChange={setDebugSample}
            onSubmit={handleDebugSubmit}
          />
        )
      case 'interview':
        return (
          <InterviewQuestionsPanel
            result={interviewMutation.data ?? null}
            isLoading={interviewMutation.isPending}
            error={interviewMutation.error?.message ?? null}
            count={interviewCount}
            onCountChange={setInterviewCount}
            onLoad={handleInterview}
          />
        )
      case 'translate':
        return (
          <TranslatePanel
            result={translateMutation.data ?? null}
            sourceLanguage={language}
            isLoading={translateMutation.isPending}
            error={translateMutation.error?.message ?? null}
            onSubmit={handleTranslate}
            onRetry={() => translateMutation.reset()}
          />
        )
      case 'review':
      default:
        return (
          <ReviewPanel
            result={reviewResult}
            isLoading={reviewMutation.isPending}
            error={reviewMutation.error?.message ?? null}
            onRetry={handleReview}
          />
        )
    }
  }

  // ── ui ───────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#06070b] text-slate-100 font-sans">
      <div className="mx-auto max-w-7xl flex flex-col gap-6 px-4 py-5 lg:px-6">

        {/* ── header ── */}
        <header className="rounded-3xl border border-[#1c2233] bg-[#0d1018]/90 px-5 py-5
                           shadow-[0_20px_70px_rgba(2,8,23,0.45)] backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-500/20
                              bg-blue-500/10 px-3 py-1 text-[11px] font-semibold uppercase
                              tracking-[0.25em] text-blue-300">
                <span className="h-2 w-2 rounded-full bg-blue-400" />
                Code Intelligence Agent
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Review, explain, debug, and optimize code in one place.
              </h1>
              <p className="mt-3 text-sm leading-7 text-slate-400 sm:text-[15px]">
                Paste code, hit Review, then switch into explanation, optimization, debugging,
                translation, and interview prep — all without losing context.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-sm text-slate-300">
              <div className="rounded-2xl border border-[#1e2333] bg-[#161a24] px-3 py-2">
                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Mode</div>
                <div className="font-medium capitalize">{mode}</div>
              </div>
              <div className="rounded-2xl border border-[#1e2333] bg-[#161a24] px-3 py-2">
                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Language</div>
                <div className="font-medium capitalize">{language}</div>
              </div>
              {hasSubmitted && (
                <button
                  onClick={handleNewSession}
                  className="rounded-2xl border border-[#1e2333] bg-[#161a24] px-3 py-2
                             hover:border-blue-500/40 hover:text-white transition-colors text-slate-400"
                >
                  <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Session</div>
                  <div className="font-medium">New ↺</div>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* ── main grid ── */}
        <div className={`grid gap-6 ${historyOpen ? 'xl:grid-cols-[1.6fr_0.8fr]' : ''}`}>

          {/* ── left column: editor + panels ── */}
          <section className="rounded-3xl border border-[#1c2233] bg-[#0d1018]/90 p-4
                              shadow-[0_20px_70px_rgba(2,8,23,0.35)] sm:p-5">
            <CodeEditor onSubmit={handleReview} isLoading={reviewMutation.isPending} />

            {/* pre-submit hint */}
            {!hasSubmitted && !reviewMutation.isPending && (
              <div className="mt-5 rounded-2xl border border-dashed border-[#2a3050]
                              bg-[#0b0d12] p-4 text-sm text-slate-400">
                <p className="font-medium text-slate-300">How it works</p>
                <p className="mt-2 leading-7">
                  Hit <span className="text-blue-400 font-medium">Review Code</span> to kick things off.
                  Results appear instantly in the Review tab, then all other tabs unlock — each
                  fetches independently so a slow Optimize call never blocks your Explain tab.
                </p>
              </div>
            )}

            {/* top-level review error (before tabs appear) */}
            {reviewMutation.error && !hasSubmitted && (
              <div className="mt-5">
                <ErrorState
                  message={reviewMutation.error.message}
                  onRetry={handleReview}
                />
              </div>
            )}

            {/* tabs + panel */}
            {hasSubmitted && (
              <div className="mt-5 space-y-4">
                <TabNavigation
                  tabs={tabItems}
                  activeTab={activeTab}
                  onSelect={setActiveTab}
                  onHistoryClick={() => setHistoryOpen(v => !v)}
                  historyOpen={historyOpen}
                />
                <div className="rounded-2xl border border-[#1e2333] bg-[#080b11] p-4 sm:p-5 min-h-48">
                  {renderPanel()}
                </div>
              </div>
            )}
          </section>

          {/* ── right column: history + signal overview — only when history is open ── */}
          {historyOpen && (
          <aside className="space-y-4">
            <HistorySidebar
              isOpen={historyOpen}
              onToggle={() => setHistoryOpen(v => !v)}
            />

            <div className="rounded-3xl border border-[#1c2233] bg-[#0d1018]/90 p-4
                            shadow-[0_20px_70px_rgba(2,8,23,0.25)]">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-200">Signal overview</p>
                <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-[10px] font-semibold
                                 uppercase tracking-[0.25em] text-blue-300">
                  Live
                </span>
              </div>
              <div className="space-y-2 text-sm text-slate-400">
                <div className="flex items-center justify-between rounded-xl border border-[#1e2333]
                                bg-[#11151f] px-3 py-2">
                  <span>Issues found</span>
                  <span className="font-medium text-slate-200">
                    {reviewResult ? reviewResult.issues.length : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-[#1e2333]
                                bg-[#11151f] px-3 py-2">
                  <span>Health score</span>
                  <span className={`font-medium ${
                    reviewResult
                      ? reviewResult.health_score >= 80 ? 'text-emerald-400'
                      : reviewResult.health_score >= 50 ? 'text-amber-400'
                      : 'text-red-400'
                    : 'text-slate-500'
                  }`}>
                    {reviewResult ? reviewResult.health_score : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-[#1e2333]
                                bg-[#11151f] px-3 py-2">
                  <span>Critical issues</span>
                  <span className="font-medium text-red-400">
                    {reviewResult
                      ? reviewResult.issues.filter(i => i.severity === 'critical').length
                      : '—'}
                  </span>
                </div>
              </div>
            </div>
          </aside>
          )}

        </div>
      </div>
    </div>
  )
}
