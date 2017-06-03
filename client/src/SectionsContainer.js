import React, { Component } from 'react';

class SectionsContainer extends Component{
    componentDidMount(){
        this.props.didMount(this.props.match);
    }

    render(){
        return(
            <div>{this.props.sections}</div>
        )
    }
};

export default SectionsContainer;