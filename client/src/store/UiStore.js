import {create} from 'zustand'
import {persist} from 'zustand/middleware'

// Get initial theme from system preference
const getInitialTheme = () => {
  if (typeof window !== 'undefined') {
    // First check localStorage
    const storedTheme = localStorage.getItem('ui-store')
    if (storedTheme) {
      const { state } = JSON.parse(storedTheme)
      return state.theme
    }
    // Then check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'light'
}

// Initialize theme on DOM
const initializeTheme = (theme) => {
  if (typeof window !== 'undefined') {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }
}

const useUiStore = create(
  persist(
    (set) => ({
      theme: getInitialTheme(),
      toggleTheme: () => 
        set((state) => {
          const newTheme = state.theme === 'light' ? 'dark' : 'light'
          initializeTheme(newTheme)
          return { theme: newTheme }
        }),
      toast: {
        message: '',
        type: 'success',
        show: false,
        setShow: (show) => set((state) => ({ toast: { ...state.toast, show } })),
        setMessage: (message) => set((state) => ({ toast: { ...state.toast, message } })),
        setType: (type) => set((state) => ({ toast: { ...state.toast, type } })),
      },
    }),
    {
      name: 'ui-store',
      partialize: (state) => ({ theme: state.theme }),
      onRehydrateStorage: () => (state) => {
        // Ensure theme is applied after rehydration
        if (state) {
          initializeTheme(state.theme)
        }
      }
    }
  )
)

export default useUiStore