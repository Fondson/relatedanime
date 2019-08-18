import React, { Component } from 'react';
import Client from './Client';
import Autosuggest from 'react-autosuggest';

// Teach Autosuggest how to calculate suggestions for any given input value.
const getSuggestions = async value => {
  const inputValue = value.trim().toLowerCase();
  if (inputValue.length < 3) {
	  return [];
  } 
  let ret = await Client.searchWithoutCb(inputValue, 5);
  return ret;
};

// When suggestion is clicked, Autosuggest needs to populate the input
// based on the clicked suggestion. Teach Autosuggest how to calculate the
// input value for every given suggestion.
const getSuggestionValue = suggestion => suggestion.name;

// Use your imagination to render suggestions.
const renderSuggestion = suggestion => (
  <div>
    {suggestion.name}
  </div>
);

class SearchForm extends React.Component {
  constructor() {
    super();

    // Autosuggest is a controlled component.
    // This means that you need to provide an input value
    // and an onChange handler that updates this value (see below).
    // Suggestions also need to be provided to the Autosuggest,
    // and they are initially empty because the Autosuggest is closed.
    this.state = {
      value: '',
      suggestions: []
    };
  }

  onChange = (event, { newValue }) => {
    this.setState({
      value: newValue
    });
  };

  // Autosuggest will call this function every time you need to update suggestions.
  // You already implemented this logic above, so just use it.
  onSuggestionsFetchRequested = async ({ value }) => {
    this.setState({
      suggestions: await getSuggestions(value)
    });
  };

  // Autosuggest will call this function every time you need to clear suggestions.
  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    });
  };

  render() {
	const { value, suggestions } = this.state;

	// Autosuggest will pass through all these props to the input.
    const inputProps = {
      placeholder: 'Search anime',
      value,
      onChange: (e, n) => {
		  this.onChange(e, n)
		  this.props.handleChange(e, n);
	  }
    };

    // Finally, render it!
    return (
		<form style={{ ...this.props.style}} onSubmit={(e) => {
			e.preventDefault();
			if (this.state.value && this.state.value.trim() !== '') {
				this.props.searchWithValue(e);
				this.onSuggestionsClearRequested();
			}
			// clear search bar
		  	this.onChange(e, { newValue: '' });
		  	this.props.handleChange(e, { newValue: '' });
		}}>
			<Autosuggest
				suggestions={suggestions}
				onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
				onSuggestionsClearRequested={this.onSuggestionsClearRequested}
				getSuggestionValue={getSuggestionValue}
				renderSuggestion={renderSuggestion}
				inputProps={inputProps}
			/>
		</form>
    );
  }
}

export default SearchForm;