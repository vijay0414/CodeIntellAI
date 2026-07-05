import { useRef, useState } from 'react'

const SUPPORTED_EXTS = ['.py','.js','.jsx','.ts','.tsx','.java','.cpp','.go','.rs','.cs']

const EXT_LANG: Record<string, string> = {
  '.py': 'Python', '.js': 'JavaScript', '.jsx': 'JavaScript',
  '.ts': 'TypeScript', '.tsx': 'TypeScript', '.java': 'Java',
  '.cpp': 'C++', '.go': 'Go', '.rs': 'Rust', '.cs': 'C#',
}

function detectLabel(name: string): string {
  const dot = name.lastIndexOf('.')
  if (dot === -1) return 'Unknown'
  return EXT_LANG[name.slice(dot).toLowerCase()] ?? 'Unknown'
}

interface Props {
  onSubmit: (files: File[], mode: 'beginner' | 'advanced') => void
  isLoading: boolean
}

export function BatchUpload({ onSubmit, isLoading }: Props) {
  const [files, setFiles]     = useState<File[]>([])
  const [mode, setMode]       = useState<'beginner' | 'advanced'>('beginner')
  const [dragging, setDragging] = useState(false)
  const inputRef              = useRef<HTMLInputElement>(null)

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return
    const next = [...files]
    Array.from(incoming).forEach(f => {
      if (next.length >= 10) return
      if (!next.find(x => x.name === f.name)) next.push(f)
    })
    setFiles(next)
  }

  const removeFile = (name: string) => setFiles(f => f.filter(x => x.name !== name))

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    addFiles(e.dataTransfer.files)
  }

  const handleSubmit = () => {
    if (files.length === 0 || isLoading) return
    onSubmit(files, mode)
  }

  return (
    <div className="space-y-4 panel-enter">
      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative rounded-xl border-2 border-dashed cursor-pointer
                    flex flex-col items-center justify-center gap-3 py-12 transition-colors
                    ${dragging
                      ? 'border-red-500 bg-red-500/10'
                      : 'border-[#3d1515] bg-[#150909] hover:border-red-700/60 hover:bg-[#1a0e0e]'}`}
      >
        <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20
                        flex items-center justify-center">
          <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
          </svg>
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-white">Drop files here or click to browse</p>
          <p className="text-xs text-[#7a5050] mt-1">
            Up to 10 files · 200 KB each · {SUPPORTED_EXTS.join(' ')}
          </p>
        </div>
        <input ref={inputRef} type="file" multiple className="hidden"
          accept={SUPPORTED_EXTS.join(',')}
          onChange={e => addFiles(e.target.files)} />
      </div>

      {/* File preview list */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7a5050]">
              {files.length} file{files.length > 1 ? 's' : ''} selected
            </p>
            <button onClick={() => setFiles([])}
              className="text-xs text-[#5a3030] hover:text-red-400 transition-colors">
              Clear all
            </button>
          </div>
          {files.map(f => (
            <div key={f.name}
              className="flex items-center gap-3 rounded-xl border border-[#2e1a1a]
                         bg-[#1a1010] px-3 py-2.5">
              <div className="w-7 h-7 rounded-lg bg-red-600/10 border border-red-600/20
                              flex items-center justify-center shrink-0">
                <svg className="w-3.5 h-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{f.name}</p>
                <p className="text-[11px] text-[#5a3030]">
                  {detectLabel(f.name)} · {(f.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <button onClick={() => removeFile(f.name)}
                className="text-[#5a3030] hover:text-red-400 transition-colors shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Mode + submit */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex bg-[#1a1010] border border-[#2e1a1a] rounded-lg p-0.5 gap-0.5">
          {(['beginner','advanced'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`px-3 py-1.5 text-xs rounded-md font-medium capitalize transition-all ${
                mode === m ? 'bg-red-600 text-white' : 'text-[#7a5050] hover:text-white'
              }`}>
              {m}
            </button>
          ))}
        </div>

        <button onClick={handleSubmit}
          disabled={files.length === 0 || isLoading}
          className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500
                     disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm
                     font-semibold rounded-lg transition-all shadow-lg shadow-red-900/30
                     active:scale-95">
          {isLoading ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Reviewing {files.length} files…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
              Review {files.length > 0 ? `${files.length} Files` : 'Files'}
            </>
          )}
        </button>
      </div>
    </div>
  )
}
