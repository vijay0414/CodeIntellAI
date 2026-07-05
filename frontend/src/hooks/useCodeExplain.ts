import { useMutation } from '@tanstack/react-query'
import { explainCode } from '../api/endpoints'
export function useCodeExplain() {
  return useMutation({ mutationFn: explainCode })
}
