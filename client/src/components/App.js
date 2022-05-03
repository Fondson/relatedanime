import './App.css'

import React from 'react'
import { Router, Route, Redirect, Switch } from 'react-router-dom'

import ErrorPage from './ErrorPage'
import history from '../history'
import LandingPage from './LandingPage'
import SectionsContainer from './SectionsContainer'

function App() {
  return (
    <Router history={history}>
      <div className="App">
        <Switch>
          <Route exact path="/" render={() => <LandingPage />} />
          <Route exact path="/index.html" render={() => <Redirect to="/" />} />{' '}
          {/*this is to handle the service worker*/}
          <Route exact path="/error" render={() => <ErrorPage />} />
          <Route
            exact
            path="/:malType(anime|manga)/:id([0-9]+)"
            render={({ match }) => (
              <SectionsContainer malType={match.params.malType} id={match.params.id} />
            )}
          />
          <Route exact path="/*" render={() => <Redirect to="/error" />} />
        </Switch>
      </div>
    </Router>
  )
}

export default App
