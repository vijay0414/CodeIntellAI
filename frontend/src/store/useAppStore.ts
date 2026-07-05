import { create } from 'zustand'
import type { BatchReviewResult, Language, Mode, ReviewResult, TabId } from '../types'

// ── History entry stored in memory (session only) ─────────────────────────────
export interface HistoryEntry {
  id:           string
  code:         string
  language:     Language
  mode:         Mode
  health_score: number
  summary:      string
  created_at:   string
}

interface AppStore {
  code:         string
  language:     Language
  mode:         Mode
  reviewResult: ReviewResult | null
  batchResult:  BatchReviewResult | null
  hasSubmitted: boolean
  activeTab:    TabId
  history:      HistoryEntry[]

  setCode:         (c: string)     => void
  setLanguage:     (l: Language)   => void
  setMode:         (m: Mode)       => void
  setReviewResult: (r: ReviewResult, code: string, language: Language, mode: Mode) => void
  setBatchResult:  (r: BatchReviewResult) => void
  setActiveTab:    (t: TabId)      => void
  loadFromHistory: (entry: HistoryEntry) => void
  clearHistory:    () => void
  reset:           () => void
}

const SEED = `def find_duplicates(arr):
    seen = []
    duplicates = []
    for item in arr:
        if item in seen:
            duplicates.append(item)
        else:
            seen.append(item)
    return duplicates

numbers = [1, 2, 3, 2, 4, 3, 5]
print(find_duplicates(numbers))
`

export const useAppStore = create<AppStore>(set => ({
  code:         SEED,
  language:     'python',
  mode:         'beginner',
  reviewResult: null,
  batchResult:  null,
  hasSubmitted: false,
  activeTab:    'review',
  history:      [],

  setCode:     code     => set({ code }),
  setLanguage: language => set({ language }),
  setMode:     mode     => set({ mode }),

  setReviewResult: (reviewResult, code, language, mode) => set(state => {
    const entry: HistoryEntry = {
      id:           `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      code,
      language,
      mode,
      health_score: reviewResult.health_score,
      summary:      reviewResult.summary,
      created_at:   new Date().toISOString(),
    }
    return {
      reviewResult,
      hasSubmitted: true,
      history: [entry, ...state.history].slice(0, 50),
    }
  }),

  setBatchResult: batchResult => set({ batchResult }),

  setActiveTab: activeTab => set({ activeTab }),

  loadFromHistory: (entry) => set({
    code:         entry.code,
    language:     entry.language,
    mode:         entry.mode,
    reviewResult: null,
    hasSubmitted: false,
    activeTab:    'review',
  }),

  clearHistory: () => set({ history: [] }),

  reset: () => set({
    reviewResult: null,
    hasSubmitted: false,
    activeTab:    'review',
  }),
}))
