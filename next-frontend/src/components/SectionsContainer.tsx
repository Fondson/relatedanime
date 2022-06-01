import Section from 'components/Section'
import { useCallback } from 'react'
import { AnimeItem } from 'types/common'
const topOrder = ['TV', 'ONA', 'Manga', 'Light Novel', 'Movie']

type AnimeItemsByType = {
  [key: string]: AnimeItem[]
}

type SectionsContainerProps = {
  animes: AnimeItemsByType
}

function SectionsContainer({ animes }: SectionsContainerProps) {
  const getOrderIndex = useCallback((type: string) => {
    const index = topOrder.indexOf(type)
    return index === -1 ? topOrder.length : index
  }, [])

  return (
    <>
      {Object.entries(animes)
        .sort((a, b) => {
          return getOrderIndex(a[0]) - getOrderIndex(b[0]) || a[0].localeCompare(b[0])
        })
        .map(([key, value]) => {
          const animes = value.filter(({ maybeRelated }) => !maybeRelated)
          if (animes.length === 0) return null

          return <Section key={key} data={{ header: key, animes }} />
        })}

      <Section
        data={{
          header: 'Related series',
          animes: Object.values(animes)
            .flat()
            .filter(({ maybeRelated }) => maybeRelated)
            .map((anime) => ({ ...anime, link: `/${anime.link.split('/').slice(-2).join('/')}` })),
        }}
      />
    </>
  )
}

export default SectionsContainer
