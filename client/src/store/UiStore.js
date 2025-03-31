import {create} from 'zustand'
import {persist} from 'zustand/middleware'

// Get initial theme from system preference
const getInitialTheme = () => {
  if (typeof window !== 'undefined') {
    // First check localStorage
    const storedTheme = localStorage.getItem('ui-store')
    if (storedTheme) {
      try {
        const { state } = JSON.parse(storedTheme)
        if (state?.theme) return state.theme
      } catch (e) {
        console.error('Error parsing stored theme:', e)
      }
    }
    // Then check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'light'
}

// Initialize theme on DOM
const initializeTheme = (theme) => {
  if (typeof window !== 'undefined') {
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    const themeColor = theme === 'dark' ? '#171717' : '#ffffff'
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', themeColor)
    }
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