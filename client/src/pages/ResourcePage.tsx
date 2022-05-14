import { crawl } from 'Client'
import AnimeSeriesAutoSuggestInput from 'components/AnimeSeriesAutoSuggestInput'
import FancyScrollbarContainer from 'components/FancyScrollbarContainer'
import SectionsContainer from 'components/SectionsContainer'
import LoadingPage from 'pages/LoadingPage'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Navigate, useParams } from 'react-router-dom'
import { AnimeItem, MalType } from 'types/common'
import { ReactComponent as HomeIcon } from 'icons/home.svg'
import useCheckMobile from 'hooks/checkMobile'

const defaultLoadingString = 'Scraping MAL...'

type AnimeItemsByType = {
  [key: string]: AnimeItem[]
}

type ResourcePageProps = {
  malType: MalType
}

const ResourcePage = ({ malType }: ResourcePageProps) => {
  const isMobile = useCheckMobile()

  const [isLoading, setIsLoading] = useState(true)
  const [loadingString, setLoadingString] = useState(defaultLoadingString)
  const [animes, setAnimes] = useState<AnimeItemsByType>({})
  const [error, setError] = useState(false)

  const { malId } = useParams()
  if (!error && isNaN(parseInt(malId))) {
    setError(true)
  }

  useEffect(() => {
    if (error) return

    setIsLoading(true)
    crawl(
      malType,
      malId,
      (e) => {
        setLoadingString('Found ' + e.data)
      },
      (e) => {
        setLoadingString(defaultLoadingString)
        if (e.data) {
          setAnimes(JSON.parse(e.data))
          setIsLoading(false)
        } else {
          setError(true)
        }
      },
    )
  }, [malType, malId, error])

  if (error) {
    return <Navigate to="/error" replace />
  }
  if (isLoading) {
    return <LoadingPage loadingString={loadingString} />
  }

  return (
    <FancyScrollbarContainer className={`${isMobile ? '' : 'h-screen'} overflow-y-auto`}>
      <div className="mx-auto max-w-6xl px-6 py-7 lg:py-14">
        <div className="min-h-10 mb-4 flex">
          <Link to="/" className="flex-none pr-5">
            <HomeIcon className="w-10 fill-white stroke-white transition-all hover:brightness-50" />
          </Link>
          <div className="flex-grow">
            <AnimeSeriesAutoSuggestInput />
          </div>
        </div>
        <SectionsContainer animes={animes} />
      </div>
    </FancyScrollbarContainer>
  )
}

export default ResourcePage
