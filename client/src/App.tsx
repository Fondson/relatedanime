import 'App.css'

import { Router, Route, Redirect, Switch } from 'react-router-dom'

import ErrorPage from 'pages/ErrorPage'
import history from 'browserHistory'
import LandingPage from 'pages/LandingPage'
import SectionsContainer from 'pages/SectionsContainer'

function App() {
  return (
    <Router history={history}>
      <div className="App">
        <Switch>
          <Route exact path="/" render={() => <LandingPage />} />
          <Route exact path="/index.html" render={() => <Redirect to="/" />} />
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
