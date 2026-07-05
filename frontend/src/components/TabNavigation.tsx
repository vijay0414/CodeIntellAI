import type { TabId } from '../types'

interface TabItem { id: TabId; label: string }
interface Props {
  tabs: TabItem[]
  activeTab: TabId
  onSelect: (tab: TabId) => void
  onHistoryClick: () => void
  historyOpen: boolean
}

const TAB_ICONS: Record<TabId, string> = {
  review:    '🔍',
  explain:   '📖',
  optimize:  '⚡',
  debug:     '🐛',
  interview: '🎯',
  translate: '🌐',
}

export function TabNavigation({ tabs, activeTab, onSelect, onHistoryClick, historyOpen }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {tabs.map(tab => {
        const isActive = tab.id === activeTab
        return (
          <button key={tab.id} onClick={() => onSelect(tab.id)}
            className={`tab-btn ${isActive ? 'tab-btn-active' : 'tab-btn-inactive'}`}>
            <span className="text-sm">{TAB_ICONS[tab.id]}</span>
            {tab.label}
          </button>
        )
      })}
      <button onClick={onHistoryClick}
        className={`tab-btn ${historyOpen ? 'tab-btn-active' : 'tab-btn-inactive'}`}>
        🕓 History
      </button>
    </div>
  )
}
