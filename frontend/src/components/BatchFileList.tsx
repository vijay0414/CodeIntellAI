import { useState } from 'react'
import type { BatchFileResult, ReviewIssue, Severity, IssueCategory } from '../types'

// Reuse same colour maps as ReviewPanel
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

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return (
    <span className="text-xs font-semibold text-[#5a3030] bg-[#1a0e0e]
                     border border-[#2e1a1a] px-2 py-0.5 rounded-full">
      error
    </span>
  )
  const color = score >= 80 ? 'text-green-400 bg-green-900/20 border-green-800/30'
    : score >= 50 ? 'text-amber-400 bg-amber-900/20 border-amber-800/30'
    : 'text-red-400 bg-red-900/20 border-red-800/30'
  return (
    <span className={`text-xs font-bold border px-2 py-0.5 rounded-full ${color}`}>
      {score}/100
    </span>
  )
}

function FileRow({ file }: { file: BatchFileResult }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-xl border border-[#2e1a1a] bg-[#1a1010] overflow-hidden">
      {/* Header row — always visible, click to expand */}
      <button
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#2a1414] transition-colors"
        onClick={() => setOpen(v => !v)}
      >
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

      {/* Expanded content */}
      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-[#2e1a1a] space-y-2 panel-enter">
          {file.error ? (
            <div className="flex items-start gap-2 rounded-xl border border-red-800/30
                            bg-red-900/10 p-3">
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
          )}
        </div>
      )}
    </div>
  )
}

interface Props { files: BatchFileResult[] }

export function BatchFileList({ files }: Props) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-white">
        File Results
        <span className="ml-2 text-xs text-[#5a3030]">({files.length} files)</span>
      </p>
      <div className="space-y-2">
        {files.map((f, i) => <FileRow key={i} file={f} />)}
      </div>
    </div>
  )
}
