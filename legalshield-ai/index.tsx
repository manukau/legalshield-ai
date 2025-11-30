import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
// Kita import Analytics dari Vercel
import { Analytics } from "@vercel/analytics/react"

const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
      {/* CCTV Terpasang Di Sini */}
      <Analytics />
    </React.StrictMode>,
  )
}
