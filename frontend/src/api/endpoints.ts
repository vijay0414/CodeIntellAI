import client from './client'
import type {
  ReviewResult, ExplainResult, DebugResult,
  OptimizeResult, InterviewResult, TranslateResult,
  HistoryResponse, Language, Mode,
} from '../types'

// ── Review ────────────────────────────────────────────────────────────────────
export interface ReviewPayload   { code: string; language: Language; mode: Mode }
export const reviewCode = (p: ReviewPayload) =>
  client.post<ReviewResult>('/api/review', p).then(r => r.data)

// ── Explain ───────────────────────────────────────────────────────────────────
export interface ExplainPayload  { code: string; language: Language; mode: Mode }
export const explainCode = (p: ExplainPayload) =>
  client.post<ExplainResult>('/api/explain', p).then(r => r.data)

// ── Debug ─────────────────────────────────────────────────────────────────────
export interface DebugPayload {
  code: string; language: Language
  error_trace: string; sample_input?: string | null
}
export const debugCode = (p: DebugPayload) =>
  client.post<DebugResult>('/api/debug', p).then(r => r.data)

// ── Optimize ──────────────────────────────────────────────────────────────────
export interface OptimizePayload { code: string; language: Language }
export const optimizeCode = (p: OptimizePayload) =>
  client.post<OptimizeResult>('/api/optimize', p).then(r => r.data)

// ── Interview ─────────────────────────────────────────────────────────────────
export interface InterviewPayload { code: string; language: Language; count: number }
export const getInterviewQuestions = (p: InterviewPayload) =>
  client.post<InterviewResult>('/api/interview-questions', p).then(r => r.data)

// ── Translate ─────────────────────────────────────────────────────────────────
export interface TranslatePayload {
  code: string; source_language: string
  target_language: string; mode: Mode
}
export const translateCode = (p: TranslatePayload) =>
  client.post<TranslateResult>('/api/translate', p).then(r => r.data)

// ── History ───────────────────────────────────────────────────────────────────
export const getHistory = (userId: string, page = 1, pageSize = 20) =>
  client
    .get<HistoryResponse>(`/api/history/${userId}`, {
      params: { page, page_size: pageSize },
    })
    .then(r => r.data)

// Delete all history for a user — called on browser tab close via sendBeacon.
// sendBeacon only supports POST, so we use a POST body with method hint OR
// fall back to a plain fetch DELETE which works fine for beforeunload.
export const deleteHistoryUrl = (userId: string) =>
  `${import.meta.env.VITE_API_BASE ?? 'http://localhost:8000'}/api/history/${userId}`

// ── Batch Review ──────────────────────────────────────────────────────────────
export const batchReviewCode = (formData: FormData) =>
  client.post<import('../types').BatchReviewResult>('/api/batch-review', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data)
