import 'index.css'

import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import registerServiceWorker from 'registerServiceWorker'

import App from './App'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
)
registerServiceWorker()
