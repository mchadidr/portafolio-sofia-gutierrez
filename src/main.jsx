import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import TestApp from './test/TestApp.jsx'

const normalizedPath = window.location.pathname.replace(/\/+$/, '') || '/'
const shouldRenderTestApp = normalizedPath.endsWith('/test')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {shouldRenderTestApp ? <TestApp /> : <App />}
  </StrictMode>,
)
