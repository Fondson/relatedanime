import AnimeBackground from 'components/AnimeBackground'
import AnimeSeriesAutoSuggestInput from 'components/AnimeSeriesAutoSuggestInput'
import HomeButton from 'components/HomeButton'
import { NextPage } from 'next'

const ErrorPage: NextPage = () => {
  return (
    <div className="h-screen w-screen overflow-hidden">
      <AnimeBackground>
        <div className="flex h-full w-full items-center justify-center overflow-visible bg-black bg-opacity-40">
          <div className="mx-auto max-w-6xl px-6 py-7 lg:py-14">
            <div className="min-h-10 mb-4 flex">
              <HomeButton />
              <div className="flex-grow">
                <AnimeSeriesAutoSuggestInput />
              </div>
            </div>
            <h2 className="mx-auto mt-6 mb-4 text-center text-2xl font-medium">
              Sorry, we couldn&apos;t find the anime you were looking for.
            </h2>
          </div>
        </div>
      </AnimeBackground>
    </div>
  )
}

export default ErrorPage
