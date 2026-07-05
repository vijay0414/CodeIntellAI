import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import type { BatchFileResult, ReviewIssue, Severity, IssueCategory,
              ExplainResult, OptimizeResult, InterviewResult, Language } from '../types'
import { explainCode, optimizeCode, getInterviewQuestions } from '../api/endpoints'
import { PanelSkeleton } from './Loader'

// ── Shared colour maps (same as ReviewPanel) ──────────────────────────────────
const SEV: Record<Severity, { badge: string; bar: string }> = {
  critical: { badge: 'bg-red-500/20 text-red-300 border border-red-500/30',         bar: 'border-l-red-500'    },
  high:     { badge: 'bg-orange-500/15 text-orange-300 border border-orange-500/25', bar: 'border-l-orange-400' },
  medium:   { badge: 'bg-amber-500/15 text-amber-300 border border-amber-500/25',    bar: 'border-l-amber-400'  },
  low:      { badge: 'bg-green-500/15 text-green-300 border border-green-500/25',    bar: 'border-l-green-500'  },
}
const CAT: Record<IssueCategory, string> = {
  bug:         'bg-red-900/40 text-red-300 border border-red-800/30',
  security:    'bg-purple-900/30 text-purple-300 border border-purple-800/30',
  performance: 'bg-blue-900/30 text-blue-300 border border-blue-800/30',
  style:       'bg-[#2a1a1a] text-[#a08080] border border-[#3d1515]',
}

// ── Issue row ─────────────────────────────────────────────────────────────────
function IssueRow({ issue }: { issue: ReviewIssue }) {
  const [open, setOpen] = useState(false)
  const s = SEV[issue.severity]
  return (
    <div className={`rounded-xl border-l-2 border border-[#2e1a1a] bg-[#150909] p-3 ${s.bar}`}>
      <div className="flex items-start gap-2 cursor-pointer" onClick={() => setOpen(v => !v)}>
        {issue.line > 0 && (
          <span className="shrink-0 text-[11px] font-mono text-[#7a5050]
                           bg-[#0f0808] px-1.5 py-0.5 rounded border border-[#2e1a1a]">
            L{issue.line}
          </span>
        )}
        <div className="flex flex-wrap gap-1.5">
          <span className={`badge ${s.badge}`}>{issue.severity}</span>
          <span className={`badge ${CAT[issue.category]}`}>{issue.category}</span>
        </div>
        <svg className={`ml-auto w-4 h-4 text-[#5a3030] shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
        </svg>
      </div>
      <p className="text-sm text-[#e8d8d8] mt-2 leading-relaxed">{issue.message}</p>
      {open && (
        <div className="mt-2 pt-2 border-t border-[#2e1a1a] panel-enter">
          <p className="text-[11px] uppercase tracking-wider text-[#7a5050] mb-1">Suggestion</p>
          <p className="text-sm text-red-200 leading-relaxed">{issue.suggestion}</p>
        </div>
      )}
    </div>
  )
}

// ── Score badge ───────────────────────────────────────────────────────────────
function ScoreBadge({ score }: { score: number | null }) {
  if (score === null)
    return <span className="text-xs font-semibold text-[#5a3030] bg-[#1a0e0e] border border-[#2e1a1a] px-2 py-0.5 rounded-full">error</span>
  const color = score >= 80 ? 'text-green-400 bg-green-900/20 border-green-800/30'
    : score >= 50 ? 'text-amber-400 bg-amber-900/20 border-amber-800/30'
    : 'text-red-400 bg-red-900/20 border-red-800/30'
  return <span className={`text-xs font-bold border px-2 py-0.5 rounded-full ${color}`}>{score}/100</span>
}

// ── Explain result renderer ───────────────────────────────────────────────────
function ExplainResult({ result }: { result: ExplainResult }) {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-white/20 bg-[#fafafa] p-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-red-600 mb-2">Overview</p>
        <p className="text-sm text-[#1a1a1a] leading-relaxed">{result.overview}</p>
      </div>
      <div className="space-y-2">
        {result.walkthrough.map((step, i) => (
          <div key={i} className="rounded-xl border border-[#2e1a1a] bg-[#1a1010] p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-5 h-5 rounded-full bg-red-600/15 border border-red-500/25
                               text-red-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <p className="text-sm font-medium text-white">{step.section}</p>
            </div>
            <p className="text-xs text-[#9a7070] leading-relaxed pl-7">{step.explanation}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Optimize result renderer ──────────────────────────────────────────────────
function OptimizeResult({ result, originalCode }: { result: OptimizeResult; originalCode: string }) {
  const noChange = result.changes.length === 1 && result.changes[0].what.toLowerCase().includes('no changes')
  return (
    <div className="space-y-3">
      {/* Complexity bar */}
      <div className="flex items-center gap-3 rounded-xl border border-[#2e1a1a] bg-[#1a1010] px-4 py-3 w-fit">
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-wider text-[#7a5050] mb-1">Before</p>
          <code className="text-amber-400 font-mono text-sm font-bold">{result.complexity_before}</code>
        </div>
        <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
        </svg>
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-wider text-[#7a5050] mb-1">After</p>
          <code className="text-green-400 font-mono text-sm font-bold">{result.complexity_after}</code>
        </div>
      </div>

      {noChange ? (
        <div className="rounded-xl border border-green-800/30 bg-green-900/10 p-3 text-center">
          <p className="text-sm text-green-400 font-semibold">✓ Already optimal</p>
        </div>
      ) : (
        <>
          {/* Side-by-side code */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className="rounded-xl border border-[#2e1a1a] overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 bg-[#150909] border-b border-[#2e1a1a]">
                <span className="w-2 h-2 rounded-full bg-red-500/70" />
                <span className="text-xs text-[#9a7070]">Original</span>
              </div>
              <pre className="bg-[#0f0808] p-3 text-[11px] font-mono text-[#9a7070] overflow-x-auto whitespace-pre leading-relaxed max-h-48">
                {originalCode}
              </pre>
            </div>
            <div className="rounded-xl border border-white/20 overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 bg-[#f0f0f0] border-b border-[#e0e0e0]">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs text-[#3a3a3a]">Optimized</span>
              </div>
              <pre className="bg-[#fafafa] p-3 text-[11px] font-mono text-[#1a1a1a] overflow-x-auto whitespace-pre leading-relaxed max-h-48">
                {result.optimized_code}
              </pre>
            </div>
          </div>
          {/* Changes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {result.changes.map((c, i) => (
              <div key={i} className="flex gap-2 rounded-xl border border-[#2e1a1a] bg-[#1a1010] p-3">
                <span className="shrink-0 w-5 h-5 rounded-full bg-red-600/15 border border-red-500/25
                                 text-red-400 text-[10px] font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-medium text-white">{c.what}</p>
                  <p className="text-xs text-[#7a5050] mt-0.5 leading-relaxed">{c.why}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ── Interview result renderer ─────────────────────────────────────────────────
function InterviewResult({ result }: { result: InterviewResult }) {
  const DIFF: Record<string, string> = {
    hard:   'bg-red-500/20 text-red-300 border border-red-500/30',
    medium: 'bg-amber-500/15 text-amber-300 border border-amber-500/25',
    easy:   'bg-green-500/15 text-green-300 border border-green-500/25',
  }
  return (
    <div className="space-y-3">
      {result.topics_detected?.length > 0 && (
        <div className="rounded-xl border border-white/20 bg-[#fafafa] p-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#7a3030] mb-2">Topics</p>
          <div className="flex flex-wrap gap-2">
            {result.topics_detected.map((t, i) => (
              <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">
                {t}
              </span>
            ))}
          </div>
        </div>
      )}
      {result.questions.map((q, i) => (
        <div key={i} className="rounded-xl border border-[#2e1a1a] bg-[#1a1010] p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-5 h-5 rounded-full bg-red-600/15 border border-red-500/25
                             text-red-400 text-[10px] font-bold flex items-center justify-center shrink-0">
              {i + 1}
            </span>
            <span className={`badge ${DIFF[q.difficulty] ?? ''}`}>{q.difficulty}</span>
          </div>
          <p className="text-sm font-medium text-white leading-relaxed">{q.question}</p>
          <div className="mt-2 pt-2 border-t border-[#2e1a1a]">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#5a3030] mb-1">Answer hint</p>
            <p className="text-xs text-[#9a7070] leading-relaxed">{q.answer_hint}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Per-file sub-tab type ─────────────────────────────────────────────────────
type FileTab = 'review' | 'explain' | 'optimize' | 'interview'

const FILE_TABS: { id: FileTab; label: string; icon: string }[] = [
  { id: 'review',    label: 'Review',        icon: '🔍' },
  { id: 'explain',   label: 'Explain',       icon: '📖' },
  { id: 'optimize',  label: 'Optimize',      icon: '⚡' },
  { id: 'interview', label: 'Interview Prep', icon: '🎯' },
]

// ── Main FileRow ──────────────────────────────────────────────────────────────
function FileRow({ file }: { file: BatchFileResult }) {
  const [open,       setOpen]       = useState(false)
  const [activeTab,  setActiveTab]  = useState<FileTab>('review')
  const [intCount,   setIntCount]   = useState(5)

  // Per-file mutations — independent per row instance
  const explainM   = useMutation({ mutationFn: explainCode })
  const optimizeM  = useMutation({ mutationFn: optimizeCode })
  const interviewM = useMutation({ mutationFn: getInterviewQuestions })

  // File content comes from the batch response (we don't re-send the file,
  // but we do need the code to feed optimize/explain/interview).
  // Since the backend doesn't echo the code back, we keep a ref to what was
  // uploaded via the "code" field we receive (issues give us context).
  // We derive the "code" hint from issue suggestions joined — but that's
  // not the actual code. Instead we surface an "Analyze" button that
  // triggers the mutation using the filename as a hint for language only,
  // and we ask the user to paste if needed. HOWEVER — per the spec, the
  // batch upload sends file content to the backend. We can reconstruct the
  // original code from the file object if we hold a ref. We pass it down.
  const code = file.code ?? ''
  const language = (file.language ?? 'python') as Language

  const renderContent = () => {
    switch (activeTab) {
      case 'review':
        return file.error ? (
          <div className="flex items-start gap-2 rounded-xl border border-red-800/30 bg-red-900/10 p-3">
            <svg className="w-4 h-4 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            </svg>
            <p className="text-sm text-red-300 leading-relaxed">{file.error}</p>
          </div>
        ) : file.issues.length === 0 ? (
          <div className="rounded-xl border border-green-800/30 bg-green-900/10 p-3 text-center">
            <p className="text-sm text-green-400 font-semibold">✓ No issues found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {file.issues.map((issue, i) => <IssueRow key={i} issue={issue} />)}
          </div>
        )

      case 'explain':
        if (!code) return <NeedCode />
        if (explainM.isPending) return <PanelSkeleton cards={2} />
        if (explainM.error) return <ErrMsg msg={explainM.error.message} onRetry={() => explainM.mutate({ code, language, mode: 'beginner' })} />
        if (!explainM.data) return (
          <ActionPrompt icon="📖" label="Explain this file" sublabel="Get a section-by-section walkthrough"
            btnLabel="Explain Code"
            onRun={() => explainM.mutate({ code, language, mode: 'beginner' })} />
        )
        return <ExplainResult result={explainM.data} />

      case 'optimize':
        if (!code) return <NeedCode />
        if (optimizeM.isPending) return <PanelSkeleton cards={2} />
        if (optimizeM.error) return <ErrMsg msg={optimizeM.error.message} onRetry={() => optimizeM.mutate({ code, language })} />
        if (!optimizeM.data) return (
          <ActionPrompt icon="⚡" label="Optimize this file" sublabel="Get a diff + complexity analysis"
            btnLabel="Optimize Code"
            onRun={() => optimizeM.mutate({ code, language })} />
        )
        return <OptimizeResult result={optimizeM.data} originalCode={code} />

      case 'interview':
        if (!code) return <NeedCode />
        if (interviewM.isPending) return <PanelSkeleton cards={2} />
        if (interviewM.error) return <ErrMsg msg={interviewM.error.message} onRetry={() => interviewM.mutate({ code, language, count: intCount })} />
        if (!interviewM.data) return (
          <ActionPrompt icon="🎯" label="Interview prep for this file"
            sublabel="Generate questions based on algorithms & patterns in this file"
            btnLabel="Generate Questions"
            extra={
              <select value={intCount} onChange={e => setIntCount(Number(e.target.value))}
                className="rounded-lg border border-[#2e1a1a] bg-[#0f0808] px-2 py-1.5 text-sm text-white outline-none">
                {[5,6,7,8,9,10].map(n => <option key={n} value={n}>{n} questions</option>)}
              </select>
            }
            onRun={() => interviewM.mutate({ code, language, count: intCount })} />
        )
        return <InterviewResult result={interviewM.data} />

      default:
        return null
    }
  }

  return (
    <div className="rounded-xl border border-[#2e1a1a] bg-[#1a1010] overflow-hidden">
      {/* Header */}
      <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#2a1414] transition-colors"
        onClick={() => setOpen(v => !v)}>
        <div className="w-7 h-7 rounded-lg bg-red-600/10 border border-red-600/20
                        flex items-center justify-center shrink-0">
          <svg className="w-3.5 h-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-sm font-semibold text-white truncate">{file.filename}</p>
          <p className="text-[11px] text-[#5a3030] capitalize">{file.language}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ScoreBadge score={file.health_score} />
          {!file.error && (
            <span className="text-[11px] text-[#5a3030]">
              {file.issues.length} issue{file.issues.length !== 1 ? 's' : ''}
            </span>
          )}
          <svg className={`w-4 h-4 text-[#5a3030] transition-transform ${open ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
          </svg>
        </div>
      </button>

      {open && (
        <div className="border-t border-[#2e1a1a] panel-enter">
          {/* Sub-tabs */}
          <div className="flex flex-wrap gap-1.5 px-4 pt-3 pb-2">
            {FILE_TABS.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                            transition-all ${activeTab === t.id
                  ? 'bg-red-600 text-white shadow shadow-red-900/40'
                  : 'bg-[#150909] border border-[#2e1a1a] text-[#7a5050] hover:text-white hover:border-[#4a2020]'}`}>
                <span>{t.icon}</span>{t.label}
              </button>
            ))}
          </div>
          {/* Content */}
          <div className="px-4 pb-4 space-y-2">
            {renderContent()}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Small helpers ─────────────────────────────────────────────────────────────
function NeedCode() {
  return (
    <div className="rounded-xl border border-dashed border-[#3d1515] bg-[#120909] p-4 text-center">
      <p className="text-sm text-[#5a3030]">File code unavailable for this operation.</p>
    </div>
  )
}

function ErrMsg({ msg, onRetry }: { msg: string; onRetry: () => void }) {
  return (
    <div className="rounded-xl border border-red-800/30 bg-red-900/10 p-3 flex items-start justify-between gap-3">
      <p className="text-sm text-red-300 leading-relaxed">{msg}</p>
      <button onClick={onRetry} className="shrink-0 text-xs bg-red-600 hover:bg-red-500 text-white
                                           px-3 py-1.5 rounded-lg transition-colors">Retry</button>
    </div>
  )
}

function ActionPrompt({ icon, label, sublabel, btnLabel, onRun, extra }:
  { icon: string; label: string; sublabel: string; btnLabel: string; onRun: () => void; extra?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
      <span className="text-3xl">{icon}</span>
      <div>
        <p className="text-sm font-semibold text-white">{label}</p>
        <p className="text-xs text-[#7a5050] mt-1">{sublabel}</p>
      </div>
      {extra && <div>{extra}</div>}
      <button onClick={onRun}
        className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold
                   rounded-lg transition-all shadow-lg shadow-red-900/30 active:scale-95">
        {btnLabel}
      </button>
    </div>
  )
}

// ── BatchFileList export ──────────────────────────────────────────────────────
interface Props { files: BatchFileResult[] }

export function BatchFileList({ files }: Props) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-white">
        File Results
        <span className="ml-2 text-xs text-[#5a3030]">({files.length} files — click to expand)</span>
      </p>
      <div className="space-y-2">
        {files.map((f, i) => <FileRow key={i} file={f} />)}
      </div>
    </div>
  )
}
