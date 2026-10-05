import { create } from 'zustand'

type UiState = {
  sidebarCollapsed: boolean
  pendingDepositsCount: number
  activeModal: string | null
  tableFilters: Record<string, Record<string, string>>
  toggleSidebar: () => void
  setPendingDepositsCount: (count: number) => void
  setActiveModal: (id: string | null) => void
  setTableFilter: (table: string, key: string, value: string) => void
  clearTableFilters: (table: string) => void
}

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  pendingDepositsCount: 0,
  activeModal: null,
  tableFilters: {},
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setPendingDepositsCount: (count) => set({ pendingDepositsCount: count }),
  setActiveModal: (id) => set({ activeModal: id }),
  setTableFilter: (table, key, value) =>
    set((s) => ({
      tableFilters: {
        ...s.tableFilters,
        [table]: { ...(s.tableFilters[table] ?? {}), [key]: value },
      },
    })),
  clearTableFilters: (table) =>
    set((s) => {
      const next = { ...s.tableFilters }
      delete next[table]
      return { tableFilters: next }
    }),
}))
