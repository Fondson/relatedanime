import React, { Component } from 'react';
import { Table } from 'react-bootstrap';
import Entry from './Entry';
import './Section.css';

class Section extends Component{
    render(){
        // console.log(this.props.data.animes);
        const entryList = this.props.data.animes.map((anime) => {
            return <Entry data={anime} key={anime.type + anime.title}/>;
        });
        return(
            <div>
                <h1>{this.props.data.header}</h1>
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

export default Section;