import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
// import registerServiceWorker from './registerServiceWorker';
import './index.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
import history from './history';
import { Router } from 'react-router-dom';

ReactDOM.render((
    <Router history={history}>
        <App />
    </Router>), document.getElementById('root'));
// registerServiceWorker();
