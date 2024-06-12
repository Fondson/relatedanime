import AnimeBackground from 'components/AnimeBackground'
import AnimeSeriesAutoSuggestInput from 'components/AnimeSeriesAutoSuggestInput'
import HomeButton from 'components/HomeButton'
import { NextPage } from 'next'

type ErrorPageProps = {
  message?: string
}

const ErrorPage: NextPage<ErrorPageProps> = ({ message }) => {
  return (
    <div className="h-screen w-screen overflow-hidden">
      <AnimeBackground>
        <div className="flex h-full w-full items-center justify-center overflow-visible bg-black bg-opacity-40">
          <div className="mx-auto px-6 py-7 md:w-1/2 lg:py-14">
            <div className="mb-4 flex items-end">
              <HomeButton />
              <div className="flex-grow">
                <AnimeSeriesAutoSuggestInput />
              </div>
            </div>
            <h2 className="mx-auto mt-6 mb-4 text-center text-2xl font-medium">
              {message ?? "How did you get here? It doesn't look like that anime exists."}
            </h2>
          </div>
        </div>
      </AnimeBackground>
    </div>
  )
}

export default ErrorPage
