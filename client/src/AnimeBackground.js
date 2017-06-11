import React, { Component } from 'react';
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
			<div style={
                {
                    width: '100vw',
                    height: 'calc(100vh)',
                    overflow: 'auto',
                    backgroundSize: 'cover',
                    backgroundImage: 'url(\''+img+'\')',
                    backgroundPositionX: 'center',
                    backgroundAttachment: 'fixed',
                    backgroundRepeat: 'no-repeat',
                    display:'flex', justifyContent:'center',alignItems:'center',
                }
            } id={this.props.id}>
                {this.props.children}
			</div>
		);
	}
};

export {AnimeBackground, numOfPics, getRandomInt};