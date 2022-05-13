import Entry from 'components/Entry'
import { AnimeItem } from 'types/common'

type SectionProps = {
  data: { animes: AnimeItem[]; header: string }
}

function Section({ data }: SectionProps) {
  return (
    <div className="py-2">
      <h3 className="mt-4 text-2xl font-medium uppercase">{data.header}</h3>
      <div
        className="grid justify-center gap-x-6 px-2"
        style={{
          gridTemplateColumns: 'repeat(auto-fill, minmax(11rem, 1fr))',
        }}
      >
        {data.animes.map((anime) => {
          return (
            <div key={anime.link} className="my-5">
              <Entry data={anime} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Section
