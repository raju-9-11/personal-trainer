import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './app/globals.css'
import { DataProvider } from '@/lib/data-provider'
import { AuthProvider } from '@/lib/auth-context'
import { CustomAlert } from '@/components/ui/custom-alert'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <App />
          <CustomAlert />
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
