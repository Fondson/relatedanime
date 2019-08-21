import React, { Component } from 'react';
import {AnimeBackground, numOfPics, getRandomInt} from './AnimeBackground';
import { Button } from 'react-bootstrap';


import Client from './Client';
import Section from './Section';
import SeasonalSection from './SeasonalSection';
import SectionsContainer from './SectionsContainer';
import './LandingPage.css';

let firstPicNum = getRandomInt(0, numOfPics - 1);
let secondPicNum = (firstPicNum + 1) % numOfPics;

class LandingPage extends Component{
  constructor(props, context){
		super(props, context);

    this.state = {
      animes: [],
    };
    Client.searchSeasonal((obj) => {
      if (obj.error) {
        // console.log(obj.why);
      } else {
        // console.log(obj.data);
        this.setState({
          animes: obj.data,
        })
      }
    });
  }

	render() {
    const { animes } = this.state;
		return (
            <div>
                <AnimeBackground id='home' picNum={firstPicNum}>
                  <div className='page-scroll'>
                    <h1 className='title'>Related Anime</h1>
                    <hr className='star-light'/>
                    <h2>Welcome.<br/>Start by searching an anime series.</h2>
                    <Button bsSize='large' href='#about' active>ABOUT</Button>
                    {
                      animes.length > 0 ? (
                        <div className='seasonal-table' key = {'seasonal'}>
                          <SeasonalSection animes={animes}/>
                        </div>
                      ) : null
                    }
                  </div>
                </AnimeBackground>
                <AnimeBackground id='about' picNum={secondPicNum}>
                  <div className='page-scroll'>
                    <h1 className='title'>About</h1>
                    <hr className='star-light'/>
                    <h3 className='horizontal-center'>Discover an anime series' source material, sequels, specials, and more all on one page!</h3>
                    <h3 className='horizontal-center'>Search for an anime series using the search bar up top to get started.</h3>
                    <Button bsSize='large' href='#home' active>HOME</Button>
                  </div>
                </AnimeBackground>
            </div>
		);
	}
};

export default LandingPage;