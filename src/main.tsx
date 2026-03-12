import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// App.css no longer needed (removed with old starter)
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
