import { useMutation } from '@tanstack/react-query'
import { getInterviewQuestions } from '../api/endpoints'
export function useInterviewQuestions() {
  return useMutation({ mutationFn: getInterviewQuestions })
}
