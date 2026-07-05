import type { TabId } from '../types'

interface TabItem { id: TabId; label: string }

interface Props {
  tabs: TabItem[]
  activeTab: TabId
  onSelect: (tab: TabId) => void
  onHistoryClick: () => void
  historyOpen: boolean
}

export function TabNavigation({ tabs, activeTab, onSelect, onHistoryClick, historyOpen }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {tabs.map(tab => {
        const isActive = tab.id === activeTab
        return (
          <button
            key={tab.id}
            onClick={() => onSelect(tab.id)}
            className={`tab-btn ${isActive ? 'tab-btn-active' : 'tab-btn-inactive'}`}
          >
            {tab.label}
          </button>
        )
      })}
      <button
        onClick={onHistoryClick}
        className={`tab-btn ${historyOpen ? 'tab-btn-active' : 'tab-btn-inactive'}`}
      >
        History
      </button>
    </div>
  )
}
