import FancyScrollbarContainer from 'components/FancyScrollbarContainer'
import SeasonalEntry from 'components/SeasonalEntry'
import { useRef } from 'react'
import { useDraggable } from 'react-use-draggable-scroll'

function SeasonalSection({ animes }) {
  const ref = useRef<HTMLDivElement>()
  const { events } = useDraggable(ref)

  return (
    <div className="py-2">
      <h3 className="mt-4 text-2xl font-medium uppercase">Currently Airing</h3>
      <FancyScrollbarContainer
        className="flex gap-6 overflow-x-auto px-2"
        passRef={ref}
        {...events}
      >
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
