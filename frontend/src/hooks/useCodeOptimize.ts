import { useMutation } from '@tanstack/react-query'
import { optimizeCode } from '../api/endpoints'
export function useCodeOptimize() {
  return useMutation({ mutationFn: optimizeCode })
}
