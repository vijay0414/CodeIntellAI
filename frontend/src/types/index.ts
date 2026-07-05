// ── Primitives ────────────────────────────────────────────────────────────────

export type Mode = 'beginner' | 'advanced'

export type Language =
  | 'python' | 'javascript' | 'typescript'
  | 'java'   | 'cpp'        | 'go'
  | 'rust'   | 'csharp'

export const LANGUAGES: { value: Language; label: string; monaco: string }[] = [
  { value: 'python',     label: 'Python',     monaco: 'python'     },
  { value: 'javascript', label: 'JavaScript', monaco: 'javascript' },
  { value: 'typescript', label: 'TypeScript', monaco: 'typescript' },
  { value: 'java',       label: 'Java',       monaco: 'java'       },
  { value: 'cpp',        label: 'C++',        monaco: 'cpp'        },
  { value: 'go',         label: 'Go',         monaco: 'go'         },
  { value: 'rust',       label: 'Rust',       monaco: 'rust'       },
  { value: 'csharp',     label: 'C#',         monaco: 'csharp'     },
]

// ── Review ────────────────────────────────────────────────────────────────────

export type Severity     = 'low' | 'medium' | 'high' | 'critical'
export type IssueCategory = 'bug' | 'style'  | 'security' | 'performance'

export interface ReviewIssue {
  line:       number
  severity:   Severity
  category:   IssueCategory
  message:    string
  suggestion: string
}

export interface ReviewResult {
  health_score: number
  summary:      string
  issues:       ReviewIssue[]
}

// ── Explain ───────────────────────────────────────────────────────────────────

export interface WalkthroughStep { section: string; explanation: string }
export interface ExplainResult   { overview: string; walkthrough: WalkthroughStep[] }

// ── Debug ─────────────────────────────────────────────────────────────────────

export interface DebugResult {
  root_cause:     string
  error_location: string
  error_category: string
  fixed_code:     string
  explanation:    string
  prevention_tip: string
}

// ── Optimize ──────────────────────────────────────────────────────────────────

export interface OptimizeChange  { what: string; why: string }
export interface OptimizeResult  {
  optimized_code:    string
  changes:           OptimizeChange[]
  complexity_before: string
  complexity_after:  string
}

// ── Interview ─────────────────────────────────────────────────────────────────

export type Difficulty = 'easy' | 'medium' | 'hard'
export interface InterviewQuestion { question: string; difficulty: Difficulty; answer_hint: string }
export interface InterviewResult   { topics_detected: string[]; questions: InterviewQuestion[] }

// ── Translate ─────────────────────────────────────────────────────────────────

export interface TranslationNote { concept: string; explanation: string }
export interface TranslateResult {
  translated_code:   string
  source_language:   string
  target_language:   string
  translation_notes: TranslationNote[]
  warnings:          string[]
}

// ── History ───────────────────────────────────────────────────────────────────

export interface HistoryItem {
  review_id:            string
  code_snippet_preview: string
  language:             string
  health_score:         number | null
  has_review:           boolean
  has_explain:          boolean
  has_optimize:         boolean
  has_interview:        boolean
  has_translate:        boolean
  created_at:           string
}

export interface HistoryResponse {
  user_id: string; page: number; page_size: number; total: number
  items: HistoryItem[]
}

// ── Batch Review ─────────────────────────────────────────────────────────────

export interface BatchFileResult {
  filename:     string
  language:     string
  health_score: number | null
  issues:       ReviewIssue[]
  error:        string | null
}

export interface BatchSummary {
  total_files:          number
  average_health_score: number
  total_issues:         number
  most_common_category: string
  worst_file:           string
  best_file:            string
}

export interface BatchReviewResult {
  summary:      BatchSummary
  file_results: BatchFileResult[]
}

// ── Tabs ──────────────────────────────────────────────────────────────────────

export type TabId = 'review' | 'explain' | 'optimize' | 'debug' | 'interview' | 'translate' | 'batch'
