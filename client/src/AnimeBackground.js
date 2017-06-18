import React, { Component } from 'react';
import './AnimeBackground.css';
import sakaenoGeneral from './media/sakaeno-general.jpg';
import ngnlGeneral from './media/no-game-no-life-general.jpg';
import steinsGateGeneral from './media/steins-gate-general.jpg';

const numOfPics = 3;

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

class AnimeBackground extends Component{
	render() {
        let img;
        switch (this.props.picNum){
            case 0: img = sakaenoGeneral; break;
            case 1: img = ngnlGeneral; break;
            case 2: img = steinsGateGeneral; break;
        }

		return (
			<div className='AnimeBackground' style={ {backgroundImage: 'url(\''+img+'\')'} }id={this.props.id}>
                {this.props.children}
			</div>
		);
	}
};

export {AnimeBackground, numOfPics, getRandomInt};