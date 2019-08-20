import React, { Component } from 'react';
import './Entry.css'

class Entry extends Component{
    render(){
        let { title, link, image, startDate } = this.props.data;
        return(
            <td>
                <div className="entry">
                    <a href={link} rel="noopener noreferrer" target="_blank">
                        <img src={image} alt={title}/>
                        <div className="wrap-text">
                            <span>{title}</span>
                        </div>
                        <p>{startDate}</p>
                    </a>
                </div>
            </td>
        )
    }
};

export default Entry;