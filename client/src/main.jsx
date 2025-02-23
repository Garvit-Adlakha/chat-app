import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {CssBaseline} from '@mui/material'
import { SidebarProvider } from './components/ui/sidebar.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CssBaseline/>
    <SidebarProvider>
      <App />
    </SidebarProvider>
  </StrictMode>,
)
