// Punto de entrada de la aplicación React
// Acá es donde arranca todo: monto el componente raíz (App) dentro del div#root del HTML
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'   // estilos globales de la app
import App from './App.jsx'
import NotificationProvider from './components/ui/NotificationProvider.jsx'

// StrictMode activa advertencias extra en desarrollo para detectar problemas antes de que lleguen a producción
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <NotificationProvider>
      <App />
    </NotificationProvider>
  </StrictMode>,
)
