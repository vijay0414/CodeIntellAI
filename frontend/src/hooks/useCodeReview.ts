import { useMutation } from '@tanstack/react-query'
import { reviewCode } from '../api/endpoints'
import { useAppStore } from '../store/useAppStore'

export function useCodeReview() {
  const { setReviewResult, setActiveTab, code, language, mode } = useAppStore()

  return useMutation({
    mutationFn: reviewCode,
    onSuccess: (data) => {
      // Pass code/language/mode so the history entry stores the full context
      setReviewResult(data, code, language, mode)
      setActiveTab('review')
    },
  })
}
