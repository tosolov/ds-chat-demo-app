import { createRoot } from 'react-dom/client'
import { App } from './app/App.js'
import { setupTheme } from './app/theme.js'
import { ensureKatex } from './services/markdown/katex.js'
import './app/theme.css'
import './app/global.css'

ensureKatex()
setupTheme()

const isCapacitorNative =
  typeof window !== 'undefined' &&
  'Capacitor' in window &&
  Boolean(
    (window as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.()
  )

if (
  !isCapacitorNative &&
  'serviceWorker' in navigator &&
  (location.protocol === 'https:' || location.hostname === 'localhost')
) {
  window.addEventListener(
    'load',
    () => {
      void navigator.serviceWorker.register('./sw.js').catch(() => undefined)
    },
    { once: true }
  )
}

createRoot(document.getElementById('root') as HTMLElement).render(<App />)
