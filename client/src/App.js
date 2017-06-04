import React, { Component } from 'react';
import './App.css';
import Client from './Client';
import Section from './Section';
import SearchForm from './SearchForm';
import AnimeBackground from './AnimeBackground';
import history from './history';
import { StickyContainer, Sticky } from 'react-sticky';
import SectionsContainer from './SectionsContainer';
import { Route, Redirect, Switch } from 'react-router-dom';
import Loader from 'react-loader-advanced';
import kirinoMouse from './media/kirino-mouse.gif';

class App extends Component {
  constructor(props, context){
		super(props, context);
		this.handleChange = this.handleChange.bind(this);
		this.searchWithValue = this.searchWithValue.bind(this);
    this.sectionsDidMount = this.sectionsDidMount.bind(this);
	}

  state = {
    animes: {},
    searchValue: "",
    isLoading: false,
    loadingString: "Scraping MAL...",
  };

	handleChange(e) {
		this.setState({ searchValue: e.target.value });
	}

	searchWithValue(e){
		e.preventDefault()
    this.setState({ isLoading: true, animes: {} });
    Client.search(this.state.searchValue, (jsonObj) => {
      if (jsonObj.error) {
        history.push('/error');
        this.setState({ isLoading: false, searchValue: "" });
        return;
      }
      history.push('/'+jsonObj.id);
      Client.crawl(jsonObj.id, 
        (e) => {
          console.log(e.data);
          this.setState({
            loadingString: 'Found ' + e.data,
          });
        }, 
        (e) => {
          this.setState({
            animes : JSON.parse(e.data),
            searchValue: "",
            loadingString: "Scraping MAL...",
            isLoading: false,
          });
        });
    });
	}

  sectionsDidMount(match){
    if (this.state.isLoading) {return;}
    this.setState({ isLoading: true, animes: {} });
    Client.crawl(match.params.id, 
      (e) => {
        console.log(e.data);
        this.setState({
          loadingString: 'Found ' + e.data,
        });
      }, 
      (e) => {
        this.setState({
          animes : JSON.parse(e.data),
          searchValue: "",
          loadingString: "Scraping MAL...",
          isLoading: false,
        });
      });
  }

  render() {
    const { animes, searchValue, isLoading } = this.state;
    const allSections = Object.keys(animes).map((key) => {
      const animeSectionObj = {header: key, animes: animes[key]};
      return (
        <div key = {key}>
          <Section data = {animeSectionObj}/>
          <hr/>
        </div>
      );
    });
    return (
      <div className="App">
        <StickyContainer>
          <Loader show={isLoading} message={
            <div className='loading-container'>
              <span>
                {/*<Spinner name='pacman' style={{
                    width: '2em', 
                    margin: 'auto',
                    paddingBottom: '1em',
                  }}/>*/}
                <img className='loading' src={kirinoMouse} alt='Loading...'/> 
                <p style={{paddingRight: '1.5em', paddingLeft: '1.5em', textAlign: 'center'}}>{this.state.loadingString}</p>
              </span>
            </div>
          } messageStyle={ { background:'#191919' } } hideContentOnLoad disableDefaultStyles > <SearchForm handleChange={this.handleChange} searchValue={searchValue}  searchWithValue={this.searchWithValue}/>

            <Switch>
              <Route exact path='/' render={() => ((
                <AnimeBackground>
                  <h1 className='center-text'>Welcome.<br/>Start by searching an anime.</h1>
                </AnimeBackground>))}/>
              <Route exact path='/error' render={() => ((
                <AnimeBackground>
                  <h1 className='center-text'>Sorry.<br/>We could not find that anime.</h1>
                </AnimeBackground>))}/>
              <Route exact path='/:id([0-9]+)' render={({ match }) => <SectionsContainer didMount={this.sectionsDidMount} sections={allSections} match={match}/>}/>
              <Route exact path='/*' render={() => <Redirect to="/error"/>}/>
            </Switch>

          </Loader>
        </StickyContainer>
      </div>
    );
  }
}

export default App;
