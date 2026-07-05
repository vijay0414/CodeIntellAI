import { useMutation } from '@tanstack/react-query'
import { batchReviewCode } from '../api/endpoints'
import type { BatchReviewResult } from '../types'

export function useBatchReview() {
  return useMutation<BatchReviewResult, Error, FormData>({
    mutationFn: batchReviewCode,
  })
}
