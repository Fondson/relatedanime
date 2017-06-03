import React, { Component } from 'react';
import './Entry.css'

class Entry extends Component{
    render(){
        let { title, link, image, startDate } = this.props.data;
        return(
            <td>
                <div className="entry">
                    <img src = {image} alt={title}/>
                    <div className="wrap-text">
                        <a href={link}>{title}</a>
                    </div>
                    <p>{startDate}</p>
                </div>
            </td>
        )
    }
};

export default Entry;