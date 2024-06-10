import { Text, Timeline, TimelineItem } from '@mantine/core'
import { useInViewport } from '@mantine/hooks'
import TimelineEntry from 'components/TimelineEntry'
import { compareAsc } from 'date-fns'
import { useCallback, useEffect, useState } from 'react'
import { AnimeItem, AnimeItemsByType } from 'types/common'

type TimelineEntryViewProps = {
  animes: AnimeItemsByType
  mediaTypeFilters?: string[]
}

const TimelineEntryView = ({ animes, mediaTypeFilters }: TimelineEntryViewProps) => {
  const [latestActive, setLatestActive] = useState(0)

  const filteredAnimes = Object.fromEntries(
    Object.entries(animes).filter(([key]) =>
      mediaTypeFilters ? mediaTypeFilters.includes(key) : true,
    ),
  )
  const sortedAnimes = Object.values(filteredAnimes)
    .flat()
    .sort((a, b) => {
      // put startDate === 'Not available' at the end
      if (a.startDate === 'Not available') return 1
      if (b.startDate === 'Not available') return -1
      return compareAsc(new Date(a.startDate), new Date(b.startDate))
    })

  const inViewportChange = useCallback(
    (index: number) => (inViewport: boolean) => {
      if (inViewport) {
        setLatestActive(index)
      }
    },
    [],
  )

  return (
    <>
      <div className="flex justify-center">
        <Timeline
          className="max-w-[550px] grow"
          active={latestActive}
          bulletSize={24}
          lineWidth={2}
        >
          {sortedAnimes.map((anime, i) => (
            <TimelineItem key={anime.link}>
              <EntryItem anime={anime} inViewportChange={inViewportChange(i)} />
            </TimelineItem>
          ))}
        </Timeline>
      </div>
    </>
  )
}

type EntryItemProps = {
  anime: AnimeItem
  inViewportChange?: (inViewport: boolean) => void
}

const EntryItem = ({ anime, inViewportChange }: EntryItemProps) => {
  const { ref, inViewport } = useInViewport()

  useEffect(() => {
    if (inViewportChange) inViewportChange(inViewport)
  }, [inViewport, inViewportChange])

  return (
    <div>
      <Text className="font-bold">{anime.type}</Text>
      <TimelineEntry data={anime} />
      <div className="h-[1px]" ref={ref} />
    </div>
  )
}

export default TimelineEntryView
