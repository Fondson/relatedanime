import { useEffect, useState } from 'react'

import { AnimeBackground, numOfPics, getRandomInt } from 'components/AnimeBackground'
import Client from 'Client'
import SeasonalSection from 'components/SeasonalSection'
import AnimeSeriesAutoSuggestInput from 'components/AnimeSeriesAutoSuggestInput'

const backgroundPic = getRandomInt(0, numOfPics - 1)

const LandingPage = () => {
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
    <div className="h-screen w-screen overflow-hidden">
      <AnimeBackground picNum={backgroundPic}>
        <div className="flex h-full w-full items-center justify-center overflow-visible bg-black bg-opacity-40">
          <div className="mx-4 min-w-0">
            <h1 className="text-center text-6xl font-bold tracking-wide">Related Anime</h1>
            <h2 className="mx-auto mt-6 mb-4 text-center text-2xl font-medium md:w-1/3">
              Discover an anime series' source material, sequels, specials, and more, all on one
              page!
            </h2>
            <div className="mx-auto flex justify-center md:w-1/2">
              <AnimeSeriesAutoSuggestInput />
            </div>
            {animes.length > 0 && (
              <div className="mt-4 md:px-6">
                <SeasonalSection animes={animes} />
              </div>
            )}
          </div>
        </div>
      </AnimeBackground>
    </div>
  )
}

export default LandingPage
