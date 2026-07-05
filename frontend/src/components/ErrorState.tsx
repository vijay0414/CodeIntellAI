interface Props { message: string; onRetry?: () => void }

export function ErrorState({ message, onRetry }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center panel-enter">
      <div className="w-11 h-11 rounded-full bg-red-500/10 flex items-center justify-center">
        <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
        </svg>
      </div>
      <div>
        <p className="text-sm font-semibold text-red-400">Request failed</p>
        <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-1.5 text-xs bg-[#161a24] hover:bg-[#1c2030] border border-[#1e2333]
                     rounded-lg text-slate-300 hover:text-white transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  )
}
