import { useMutation } from '@tanstack/react-query'
import { debugCode } from '../api/endpoints'
export function useCodeDebug() {
  return useMutation({ mutationFn: debugCode })
}
