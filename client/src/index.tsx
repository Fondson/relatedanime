import './index.css'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/css/bootstrap-theme.css'

import ReactDOM from 'react-dom'

import App from './components/App'
import registerServiceWorker from './registerServiceWorker'
import './scrollEasing'

ReactDOM.render(<App />, document.getElementById('root'))
registerServiceWorker()
