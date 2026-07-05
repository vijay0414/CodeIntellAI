import { useMutation } from '@tanstack/react-query'
import { translateCode } from '../api/endpoints'
export function useCodeTranslate() {
  return useMutation({ mutationFn: translateCode })
}
