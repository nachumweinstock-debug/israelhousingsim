import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import './index.css'
import SimulatorApp from './SimulatorApp'
import { LanguageProvider } from './i18n.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <SimulatorApp />
      <Analytics />
      <SpeedInsights />
    </LanguageProvider>
  </StrictMode>,
)
