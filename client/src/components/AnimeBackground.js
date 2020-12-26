import './AnimeBackground.css';

import ngnlGeneral from '../media/no-game-no-life-general.jpg';
import sakaenoGeneral from '../media/sakaeno-general.jpg';
import steinsGateGeneral from '../media/steins-gate-general.jpg';

import React from 'react';

const numOfPics = 3;

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function AnimeBackground({ picNum, id, children }){
    let img;
    switch (picNum){
        case 0: img = sakaenoGeneral; break;
        case 1: img = ngnlGeneral; break;
        case 2: img = steinsGateGeneral; break;
    }

    return (
        <div className='AnimeBackground' style={ {backgroundImage: 'url(\''+img+'\')'} } id={id}>
            {children}
        </div>
    );
};

export {AnimeBackground, numOfPics, getRandomInt};