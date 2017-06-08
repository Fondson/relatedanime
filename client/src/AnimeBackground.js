import React, { Component } from 'react';
import sakaenoMegumi from './media/sakaeno-megumi.png';
import spiceAndWolfHolo from './media/spice-and-wolf-holo.png';
import steinsGateGeneral from './media/steins-gate-general.png';

const numOfPics = 3;

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

class AnimeBackground extends Component{
	render() {
        let img;
        switch (this.props.picNum){
            case 0: img = sakaenoMegumi; break;
            case 1: img = spiceAndWolfHolo; break;
            case 2: img = steinsGateGeneral; break;
        }

		return (
			<div style={
                {
                    width: '100vw',
                    height: 'calc(100vh)', /*34px is the size of the searchbar*/
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