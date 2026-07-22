import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import './index.css'
import SiteRouter from './SiteRouter'
import { LanguageProvider } from './i18n.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <SiteRouter />
      <Analytics />
      <SpeedInsights />
    </LanguageProvider>
  </StrictMode>,
)
