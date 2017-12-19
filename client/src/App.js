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
      Client.dbSearch(jsonObj.id, (dbJsonObj) => {
        if (dbJsonObj.error) {
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
        } else {
          this.setState({
            animes : dbJsonObj.animes,
            searchValue: "",
            loadingString: "Scraping MAL...",
            isLoading: false,
          });
        }
      });
    });
  }
  
  onBackButtonEvent(e){
    e.preventDefault();
    const id = +e.target.location.pathname.substring(1);
    if (id == 0) {
      history.replace('/');
      this.setState({ isLoading: false, searchValue: "" });
      return;
    }

    this.setState({ isLoading: true, animes: {} });
    Client.dbSearch(id, (dbJsonObj) => {
      if (dbJsonObj.error) {
        Client.crawl(id, 
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
          animes : dbJsonObj.animes,
          searchValue: "",
          loadingString: "Scraping MAL...",
          isLoading: false,
        });
      }
    });
  }

  sectionsDidMount(match){
    window.onpopstate = (e) => this.onBackButtonEvent(e);
    if (this.state.isLoading) {return;}
    this.setState({ isLoading: true, animes: {} });
    Client.dbSearch(match.params.id, (dbJsonObj) => {
      if (dbJsonObj.error) {
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
      } else {
        this.setState({
          animes : dbJsonObj.animes,
          searchValue: "",
          loadingString: "Scraping MAL...",
          isLoading: false,
        });
      }
    });
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
                  return <SearchForm style={style} handleChange={this.handleChange} searchValue={searchValue}  searchWithValue={this.searchWithValue}/>;
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
