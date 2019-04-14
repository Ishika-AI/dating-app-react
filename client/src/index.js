import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import { Route, BrowserRouter as Router } from 'react-router-dom';

import Login from './components/Login';
import Register from './components/Register';

ReactDOM.render(
    <Router>
        <div>
            <Route exact path="/" component={App} />
            <Route exact path="/register" component={Register} />
            <Route exact path="/login" component={Login} />

        </div>
    </Router>
    , document.getElementById('root')
);
registerServiceWorker();
