import Section from 'components/Section'
import { AnimeItemsByType } from 'types/common'

const topOrder = ['TV', 'ONA', 'Manga', 'Light Novel', 'Movie']

const getOrderIndex = (type: string) => {
  const index = topOrder.indexOf(type)
  return index === -1 ? topOrder.length : index
}

type GroupedEntryViewProps = {
  animes: AnimeItemsByType
  mediaTypeFilters?: string[]
}

const GroupedEntryView = ({ animes, mediaTypeFilters }: GroupedEntryViewProps) => {
  const filteredAnimes = Object.fromEntries(
    Object.entries(animes).filter(([key]) =>
      mediaTypeFilters ? mediaTypeFilters.includes(key) : true,
    ),
  )
  const relatedSeries = Object.values(filteredAnimes)
    .flat()
    .filter(({ maybeRelated }) => maybeRelated)
    .map((anime) => ({ ...anime, link: `/${anime.link.split('/').slice(-2).join('/')}` }))

  return (
    <>
      {Object.entries(filteredAnimes)
        .sort((a, b) => {
          return getOrderIndex(a[0]) - getOrderIndex(b[0]) || a[0].localeCompare(b[0])
        })
        .map(([key, value]) => {
          const animes = value.filter(({ maybeRelated }) => !maybeRelated)
          if (animes.length === 0) return null

          return <Section key={key} data={{ header: key, animes }} />
        })}

      {relatedSeries.length > 0 && (
        <Section
          data={{
            header: 'Related series',
            animes: relatedSeries,
          }}
        />
      )}
    </>
  )
}

export default GroupedEntryView
