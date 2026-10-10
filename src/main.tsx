import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// QA hook: lets the Playwright specs put the store into a given frame's state.
if (import.meta.env.DEV) {
  import('./store/useApp').then(({ useApp }) => {
    ;(window as unknown as { __insti: typeof useApp }).__insti = useApp
  })
}
