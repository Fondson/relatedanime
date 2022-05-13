import { Link } from 'react-router-dom'
import { AnimeBackground, numOfPics, getRandomInt } from 'components/AnimeBackground'
import { ReactComponent as HomeIcon } from 'icons/home.svg'
import AnimeSeriesAutoSuggestInput from 'components/AnimeSeriesAutoSuggestInput'

const errorPicNum = getRandomInt(0, numOfPics - 1)

function ErrorPage() {
  return (
    <div className="h-screen w-screen overflow-hidden">
      <AnimeBackground picNum={errorPicNum}>
        <div className="flex h-full w-full items-center justify-center overflow-visible bg-black bg-opacity-40">
          <div className="mx-auto max-w-6xl px-6 py-7 lg:py-14">
            <div className="min-h-10 mb-4 flex">
              <Link to="/" className="flex-none pr-5">
                <HomeIcon className="w-10 fill-white stroke-white transition-all hover:brightness-50" />
              </Link>
              <div className="flex-grow">
                <AnimeSeriesAutoSuggestInput />
              </div>
            </div>
            <h2 className="mx-auto mt-6 mb-4 text-center text-2xl font-medium">
              Sorry, we couldn't find the anime you were looking for.
            </h2>
          </div>
        </div>
      </AnimeBackground>
    </div>
  )
}

export default ErrorPage
