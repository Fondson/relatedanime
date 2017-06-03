import React, { Component } from 'react';
import { FormGroup, FormControl } from 'react-bootstrap';

class SearchForm extends Component{
	
	render() {
		return (
			<form style={{ ...this.props.style, overflow: 'auto'}} onSubmit={this.props.searchWithValue}>
				<FormGroup
					controlId="formBasicText"
				>
					<FormControl
						type="text"
						value={this.props.searchValue}
						placeholder="Search anime..."
						onChange={this.props.handleChange}
					/>
				</FormGroup>
			</form>
		);
	}
};

export default SearchForm;