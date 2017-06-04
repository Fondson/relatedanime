import React, { Component } from 'react';
import sakaenoMegumi from './media/sakaeno-megumi.png';

class AnimeBackground extends Component{
	render() {
		return (
			<div style={
                {
                    width: '100vw',
                    height: 'calc(100vh - 34px)', /*34px is the size of the searchbar*/
                    overflow: 'auto',
                    backgroundSize: 'cover',
                    backgroundImage: 'url(\''+sakaenoMegumi+'\')',
                    backgroundPositionX: 'center',
                    backgroundAttachment: 'fixed',
                    backgroundRepeat: 'no-repeat',
                }
            }>
                {this.props.children}
			</div>
		);
	}
};

export default AnimeBackground;