import React, { Component } from 'react';
import { Table } from 'react-bootstrap';
import SeasonalEntry from './SeasonalEntry';
import './SeasonalSection.css';
import './Section.css';

class SeasonalSection extends Component{
    render(){
        const entryList = this.props.animes.map((anime) => {
            return <SeasonalEntry data={anime} key={anime.malType + anime.id}/>;
        });
        return(
            <div>
                <h1 className='seasonal-header'>{'Currently Airing'}</h1>
                <Table bsClass="table" responsive>
                    <tbody>
                        <tr>
                            {entryList}
                        </tr>
                    </tbody>
                </Table>
            </div>
        )
    }
};

export default SeasonalSection;