import React, { Component } from 'react';
import './App.css';
import Client from './Client';
import Section from './Section';
import SearchForm from './SearchForm';
import LandingPage from './LandingPage';
import history from './history';
import { StickyContainer, Sticky } from 'react-sticky';
import { Button } from 'react-bootstrap';
import SectionsContainer from './SectionsContainer';
import { Route, Redirect, Switch } from 'react-router-dom';
import Loader from 'react-loader-advanced';
import kirinoMouse from './media/kirino-mouse.gif';
import {AnimeBackground, numOfPics, getRandomInt} from './AnimeBackground';

const errorPicNum = getRandomInt(0, numOfPics - 1);

class App extends Component {
  constructor(props, context){
		super(props, context);
		this.handleChange = this.handleChange.bind(this);
		this.searchWithEvent = this.searchWithEvent.bind(this);
    this.sectionsDidMount = this.sectionsDidMount.bind(this);
    this.searchByMalTypeAndId = this.searchByMalTypeAndId.bind(this)
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
  
  searchByMalTypeAndId(malType, id) {
      Client.precrawl(malType, id, (jsonObj) => {
        if (jsonObj.error) {
          Client.crawl(malType, id, 
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
        } else {
          this.setState({
            animes : jsonObj.series,
            searchValue: "",
            loadingString: "Scraping MAL...",
            isLoading: false,
          });
        }
      });
  }

	searchWithEvent(e){
		e.preventDefault()
    this.setState({ isLoading: true, animes: {} });
    Client.search(this.state.searchValue, (jsonObj) => {
      if (jsonObj.error) {
        history.push('/error');
        this.setState({ isLoading: false, searchValue: "" });
        return;
      }
      history.push('/' + jsonObj.malType + '/' + jsonObj.id);
      this.searchByMalTypeAndId(jsonObj.malType, jsonObj.id);
    });
  }
  
  onBackButtonEvent(e){
    e.preventDefault();
    const parts = e.target.location.pathname.split('/');
    const malType = parts[1];
    const id = +parts[2]
    if (id == 0) {
      history.replace('/');
      this.setState({ isLoading: false, searchValue: "" });
      return;
    }

    this.setState({ isLoading: true, animes: {} });
    this.searchByMalTypeAndId(malType, id)
  }

  sectionsDidMount(match){
    window.onpopstate = (e) => this.onBackButtonEvent(e);
    if (this.state.isLoading) {return;}
    this.setState({ isLoading: true, animes: {} });
    this.searchByMalTypeAndId(match.params.malType, match.params.id)
  }

  render() {
    const { animes, searchValue, isLoading } = this.state;
    const keys = Object.keys(animes);
    keys.sort();
    const len = keys.length;
    let allSections = [];
    for (let i = 0; i < len; ++i){
      const key = keys[i];
      const animeSectionObj = {header: key, animes: animes[key]};
      allSections.push(
        <div key = {key}>
          <Section data = {animeSectionObj}/>
          <hr/>
        </div>
      );
    }
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
          } messageStyle={ { background:'#191919' } } hideContentOnLoad disableDefaultStyles>
            <Sticky>
              {
                ({ isSticky, wasSticky, style, distanceFromTop, distanceFromBottom, calculatedHeight }) => {
                  return <SearchForm style={style} handleChange={this.handleChange} searchValue={searchValue}  searchWithValue={this.searchWithEvent}/>;
                }
              }
            </Sticky>
            
            <Switch>
              <Route exact path='/' render={() => ((
                <LandingPage/>))}/>
              <Route exact path='/index.html' render={() => <Redirect to="/"/>}/> {/*this is to handle the service worker*/}
              <Route exact path='/error' render={() => ((
                <AnimeBackground picNum={errorPicNum}>
                  <div>
                    <h1 className='center-text'>Sorry.<br/>We could not find that anime.</h1>
                    <Button bsSize='large' onClick={ () => history.push('/') } active>HOME</Button>
                  </div>
                </AnimeBackground>))}/>
              <Route exact path='/:malType(anime|manga)/:id([0-9]+)' render={({ match }) => <SectionsContainer didMount={this.sectionsDidMount} sections={allSections} match={match}/>}/>
              <Route exact path='/*' render={() => <Redirect to="/error"/>}/>
            </Switch>

          </Loader>
        </StickyContainer>
      </div>
    );
  }
}

export default App;
