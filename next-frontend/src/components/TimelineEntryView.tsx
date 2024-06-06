import { Text,Timeline, TimelineItem } from '@mantine/core'
import { useInViewport } from '@mantine/hooks'
import Entry from 'components/Entry'
import { compareAsc } from 'date-fns'
import { useCallback, useEffect, useState } from 'react'
import { AnimeItem, AnimeItemsByType } from 'types/common'

type TimelineEntryViewProps = {
  animes: AnimeItemsByType
}

const TimelineEntryView = ({ animes }: TimelineEntryViewProps) => {
  const [latestActive, setLatestActive] = useState(0)

  const sortedAnimes = Object.values(animes)
    .flat()
    .sort((a, b) => compareAsc(new Date(a.startDate), new Date(b.startDate)))

  const inViewportChange = useCallback(
    (index: number) => (inViewport: boolean) => {
      if (inViewport) {
        setLatestActive(index - 1)
      }
    },
    [],
  )

  return (
    <div className="flex justify-center">
      <Timeline active={latestActive} bulletSize={24} lineWidth={2}>
        {sortedAnimes.map((anime, i) => (
          <TimelineItem key={anime.link}>
            <EntryItem anime={anime} inViewportChange={inViewportChange(i)} />
          </TimelineItem>
        ))}
      </Timeline>
    </div>
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
    <div ref={ref}>
      <Text className="font-bold">{anime.type}</Text>
      <div className="max-w-[500px]">
        <Entry data={anime} layout="horizontal" />
      </div>
    </div>
  )
}

export default TimelineEntryView
