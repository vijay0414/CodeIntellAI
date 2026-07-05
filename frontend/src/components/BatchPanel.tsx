import type { BatchReviewResult } from '../types'
import { BatchUpload }     from './BatchUpload'
import { BatchSummaryCard } from './BatchSummaryCard'
import { BatchFileList }   from './BatchFileList'
import { PanelSkeleton }   from './Loader'
import { ErrorState }      from './ErrorState'

interface Props {
  result:    BatchReviewResult | null
  isLoading: boolean
  error:     string | null
  onSubmit:  (files: File[], mode: 'beginner' | 'advanced') => void
  onRetry:   () => void
}

export function BatchPanel({ result, isLoading, error, onSubmit, onRetry }: Props) {
  if (isLoading) return <PanelSkeleton cards={4} />
  if (error)     return <ErrorState message={error} onRetry={onRetry} />

  return (
    <div className="space-y-5 panel-enter">
      {/* Upload form — always visible so user can run another batch */}
      <BatchUpload onSubmit={onSubmit} isLoading={isLoading} />

      {result && (
        <>
          <BatchSummaryCard summary={result.summary} />
          <BatchFileList files={result.file_results} />
        </>
      )}
    </div>
  )
}
