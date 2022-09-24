import FancyScrollbarContainer from 'components/FancyScrollbarContainer'
import SeasonalEntry from 'components/SeasonalEntry'
import { useRef } from 'react'
import { useDraggable } from 'react-use-draggable-scroll'
import { SeasonalAnimeItem } from 'types/common'

type SeasonSectionProps = {
  animes: SeasonalAnimeItem[]
}

function SeasonalSection({ animes }: SeasonSectionProps) {
  const ref = useRef<HTMLDivElement>() as React.MutableRefObject<HTMLDivElement>
  const { events } = useDraggable(ref)

  return (
    <div className="py-2">
      <h3 className="mt-4 text-2xl font-medium uppercase">Currently Airing</h3>
      <FancyScrollbarContainer className="flex gap-6 overflow-x-auto" passRef={ref} {...events}>
        {animes.map((anime) => {
          return (
            <div key={anime.malType + anime.id} className="my-5 flex-none">
              <SeasonalEntry data={anime} />
            </div>
          )
        })}
      </FancyScrollbarContainer>
    </div>
  )
}

export default SeasonalSection
