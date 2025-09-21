import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { WalletProvider } from './contexts/WalletContext'
import AppClean from './AppClean.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WalletProvider>
      <AppClean />
    </WalletProvider>
  </StrictMode>,
)
