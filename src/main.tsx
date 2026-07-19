import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import './index.css'
import SimulatorApp from './SimulatorApp'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SimulatorApp />
    <Analytics />
    <SpeedInsights />
  </StrictMode>,
)
