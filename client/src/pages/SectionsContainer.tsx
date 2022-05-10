import { useEffect, useState } from 'react'
import { StickyContainer, Sticky } from 'react-sticky'
import { crawl } from 'Client'
import ErrorPage from 'pages/ErrorPage'
import LoadingPage from 'pages/LoadingPage'
import SearchForm from 'components/SearchForm'
import Section from 'components/Section'

const defaultLoadingString = 'Scraping MAL...'

function SectionsContainer({ malType, id }) {
  const [isLoading, setIsLoading] = useState(true)
  const [loadingString, setLoadingString] = useState(defaultLoadingString)
  const [animes, setAnimes] = useState({})
  const [error, setError] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    crawl(
      malType,
      id,
      (e) => {
        // console.log(e.data)
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
  }, [malType, id])

  if (isLoading) {
    return <LoadingPage loadingString={loadingString} />
  }
  if (error) {
    return <ErrorPage />
  }

  const keys = Object.keys(animes)
  keys.sort()
  const len = keys.length
  let allSections = []
  for (let i = 0; i < len; ++i) {
    const key = keys[i]
    const animeSectionObj = { header: key, animes: animes[key] }
    allSections.push(
      <div key={key}>
        <Section data={animeSectionObj} />
        <hr />
      </div>,
    )
  }

  return (
    <div>
      <StickyContainer>
        <Sticky>
          {({
            isSticky,
            wasSticky,
            style,
            distanceFromTop,
            distanceFromBottom,
            calculatedHeight,
            // @ts-ignore
          }) => <SearchForm style={style} topOffset={calculatedHeight} />}
        </Sticky>
        {allSections}
      </StickyContainer>
    </div>
  )
}

export default SectionsContainer
