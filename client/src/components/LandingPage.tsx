import './LandingPage.css'

import React, { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'
import { StickyContainer, Sticky } from 'react-sticky'

import { AnimeBackground, numOfPics, getRandomInt } from './AnimeBackground'
import Client from '../Client'
import SearchForm from './SearchForm'
import SeasonalSection from './SeasonalSection'

let firstPicNum = getRandomInt(0, numOfPics - 1)
let secondPicNum = (firstPicNum + 1) % numOfPics

function LandingPage() {
  const [animes, setAnimes] = useState([])

  useEffect(() => {
    Client.searchSeasonal((obj) => {
      if (obj.error) {
        console.log(obj.why)
      } else {
        setAnimes(obj.data)
      }
    })
  }, [])

  return (
    <StickyContainer>
      <Sticky>
        {({
          isSticky,
          wasSticky,
          style,
          distanceFromTop,
          distanceFromBottom,
          calculatedHeight,
        }) => {
          // @ts-ignore
          return <SearchForm style={style} topOffset={calculatedHeight} />
        }}
      </Sticky>
      <AnimeBackground id="home" picNum={firstPicNum}>
        <div className="page-scroll">
          <h1 className="title">Related Anime</h1>
          <hr className="star-light" />
          <h2>
            Welcome.
            <br />
            Start by searching an anime series.
          </h2>
          <Button bsSize="large" href="#about" active>
            ABOUT
          </Button>
          {animes.length > 0 ? (
            <div className="seasonal-table" key={'seasonal'}>
              <SeasonalSection animes={animes} />
            </div>
          ) : null}
        </div>
      </AnimeBackground>
      <AnimeBackground id="about" picNum={secondPicNum}>
        <div className="page-scroll">
          <h1 className="title">About</h1>
          <hr className="star-light" />
          <h3 className="horizontal-center">
            Discover an anime series' source material, sequels, specials, and more all on one page!
          </h3>
          <h3 className="horizontal-center">
            Search for an anime series using the search bar up top to get started.
          </h3>
          <Button bsSize="large" href="#home" active>
            HOME
          </Button>
        </div>
      </AnimeBackground>
    </StickyContainer>
  )
}

export default LandingPage
