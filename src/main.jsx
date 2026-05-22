import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Storage polyfill — bridges Claude artifact storage to localStorage for production
if (!window.storage) {
  window.storage = {
    get: async (key) => {
      try {
        const val = localStorage.getItem('av_' + key)
        return val ? { key, value: val } : null
      } catch { return null }
    },
    set: async (key, value) => {
      try {
        localStorage.setItem('av_' + key, value)
        return { key, value }
      } catch { return null }
    },
    delete: async (key) => {
      try {
        localStorage.removeItem('av_' + key)
        return { key, deleted: true }
      } catch { return null }
    },
    list: async (prefix) => {
      try {
        const keys = Object.keys(localStorage)
          .filter(k => k.startsWith('av_' + (prefix || '')))
          .map(k => k.replace('av_', ''))
        return { keys }
      } catch { return { keys: [] } }
    }
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
