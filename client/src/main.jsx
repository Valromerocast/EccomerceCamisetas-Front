// Punto de entrada de la aplicación React
// Acá es donde arranca todo: monto el componente raíz (App) dentro del div#root del HTML
import { createRoot } from 'react-dom/client'
import './index.css'   // estilos globales de la app
import App from './App.jsx'
import NotificationProvider from './components/ui/NotificationProvider.jsx'
import { Provider } from 'react-redux'
import { store } from './store/store.js'

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <NotificationProvider>
      <App />
    </NotificationProvider>
  </Provider>,
)
