// Punto de entrada de la aplicación React
// Acá es donde arranca todo: monto el componente raíz (App) dentro del div#root del HTML
import { createRoot } from 'react-dom/client'
import { PersistGate } from 'redux-persist/integration/react'
import './index.css'   // estilos globales de la app
import App from './App.jsx'
import NotificationCenter from './components/ui/NotificationCenter.jsx'
import { Provider } from 'react-redux'
import { persistor, store } from './store/store.js'

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <App />
      <NotificationCenter />
    </PersistGate>
  </Provider>,
)
