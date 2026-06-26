import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GlobalSettingsProvider } from './context/GlobalSettingsContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GlobalSettingsProvider>
      <App />
    </GlobalSettingsProvider>
  </StrictMode>,
)
