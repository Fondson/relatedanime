import Entry from 'components/Entry'
import { AnimeItem } from 'types/common'

type SectionProps = {
  data: { animes: AnimeItem[]; header: string }
}

function Section({ data }: SectionProps) {
  return (
    <div className="py-3">
      <h2 className="my-5 text-2xl font-medium uppercase">{data.header}</h2>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(6rem,1fr))] justify-center gap-x-6 md:grid-cols-[repeat(auto-fill,minmax(11rem,1fr))]">
        {data.animes.map((anime) => {
          return (
            <div key={anime.link} className="my-4">
              <Entry data={anime} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Section
