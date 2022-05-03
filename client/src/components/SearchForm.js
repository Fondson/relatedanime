import './SearchForm.css'

import React, { Component } from 'react'
import Autosuggest from 'react-autosuggest'

import Client, { search } from '../Client'
import history from '../history'

var wait = (ms) => new Promise((r, j) => setTimeout(r, ms))

/*
When suggestion is clicked, Autosuggest needs to populate the input
based on the clicked suggestion. Teach Autosuggest how to calculate the
input value for every given suggestion.
*/
const getSuggestionValue = (suggestion) => suggestion.name

// Use your imagination to render suggestions.
const renderSuggestion = (suggestion) => <div>{suggestion.name}</div>

/*
You might be temped to change this into a stateless fucntion so we can
start using react hooks, but that would be a mistake bc it's not supported.
https://github.com/captivationsoftware/react-sticky/issues/94
https://github.com/captivationsoftware/react-sticky/issues/188
*/
class SearchForm extends Component {
  constructor() {
    super()

    /*
		Autosuggest is a controlled component.
		This means that you need to provide an input value
		and an onChange handler that updates this value (see below).
		Suggestions also need to be provided to the Autosuggest,
		and they are initially empty because the Autosuggest is closed.
		*/
    this.state = {
      value: '',
      suggestions: [],
      isSearching: false,
      lastValue: '',
      error: false,
    }
  }

  onChange = (event, { newValue }) => {
    this.setState({
      value: newValue,
    })
  }

  searchWithEvent(e) {
    e.preventDefault()
    search(this.state.value, (jsonObj) => {
      // console.log(jsonObj);
      if (jsonObj.error) {
        this.setState({ error: true })
        return
      }
      jsonObj = jsonObj['data'][0]
      history.push('/' + jsonObj.malType + '/' + jsonObj.id)
    })
  }

  // Teach Autosuggest how to calculate suggestions for any given input value.
  getSuggestions = async (value) => {
    const inputValue = value.trim().toLowerCase()
    if (inputValue.length < 3) {
      return []
    }

    /* 
		The idea in the following snippet is to pause getting suggestions and wait a bit if we
		are already showing some suggestions or if we're searching.
		After waiting a bit, and the value is still the same as the lastValue, then the user
		is no longer rapidly typing and we can get the new suggestions, otherwise don't update
		the suggestions (in this case, this means just return the old one).
		*/
    this.setState({
      lastValue: value,
    })
    if (this.state.suggestions.length > 0 || this.state.isSearching) {
      // console.log('waiting at ' + value);
      await wait(800)
      if (value !== this.state.lastValue) {
        // console.log('dropping ' + value);
        return this.state.suggestions
      }
    }

    this.setState({
      isSearching: true,
    })
    let ret = await Client.searchWithoutCb(inputValue, 5)
    this.setState({
      isSearching: false,
    })
    if (ret.length === 0) {
      return this.state.suggestions
    } else {
      return ret
    }
  }

  /*
	Autosuggest will call this function every time you need to update suggestions.
	You already implemented this logic above, so just use it.
	*/
  onSuggestionsFetchRequested = async ({ value }) => {
    this.setState({
      suggestions: await this.getSuggestions(value),
    })
  }

  // Autosuggest will call this function every time you need to clear suggestions.
  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: [],
    })
  }

  render() {
    const { value, suggestions } = this.state

    // Autosuggest will pass through all these props to the input.
    const inputProps = {
      placeholder: 'Search anime',
      value,
      onChange: (e, n) => {
        this.onChange(e, n)
        // this.props.handleChange(e, n);
      },
    }

    // Finally, render it!
    return (
      <form
        style={{ ...this.props.style }}
        onSubmit={(e) => {
          e.preventDefault()
          if (this.state.value && this.state.value.trim() !== '') {
            this.searchWithEvent(e)
            this.onSuggestionsClearRequested()
          }
        }}
      >
        <Autosuggest
          suggestions={suggestions}
          onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
          onSuggestionsClearRequested={this.onSuggestionsClearRequested}
          getSuggestionValue={getSuggestionValue}
          renderSuggestion={renderSuggestion}
          inputProps={inputProps}
        />
      </form>
    )
  }
}

export default SearchForm
