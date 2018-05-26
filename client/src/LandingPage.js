import React, { Component } from 'react';
import {AnimeBackground, numOfPics, getRandomInt} from './AnimeBackground';
import { Button } from 'react-bootstrap';

let firstPicNum = getRandomInt(0, numOfPics - 1);
let secondPicNum = (firstPicNum + 1) % numOfPics;

class LandingPage extends Component{
	render() {
		return (
            <div>
              <h1>IMPORTANT<br/>The MyAnimeList API, which this website depends on, is currently down</h1>
                <AnimeBackground id='home' picNum={firstPicNum}>
                  <div className='page-scroll'>
                    <h1 className='title'>Related Anime</h1>
                    <hr className='star-light'/>
                    <h2>Welcome.<br/>Start by searching an anime series.</h2>
                    <Button bsSize='large' href='#about' active >ABOUT</Button>
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