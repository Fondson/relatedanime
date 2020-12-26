import React from 'react';
import { Button } from 'react-bootstrap';

import { AnimeBackground, numOfPics, getRandomInt } from './AnimeBackground';
import history from '../history';

const errorPicNum = getRandomInt(0, numOfPics - 1);

function ErrorPage() {
    return (
        <AnimeBackground id='error' picNum={errorPicNum}>
            <div>
            <h1 className='center-text'>Sorry.<br/>Sorry, we could not find that anime right now.</h1>
            <Button bsSize='large' onClick={ () => history.push('/') } active>HOME</Button>
            </div>
        </AnimeBackground>
    );
}

export default ErrorPage;