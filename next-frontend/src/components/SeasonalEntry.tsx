import Image from 'next/image'
import Link from 'next/link'
import { SeasonalAnimeItem } from 'types/common'

type SeasonalEntryProps = {
  data: SeasonalAnimeItem
}

function SeasonalEntry({ data }: SeasonalEntryProps) {
  const { img, title, malType, id } = data
  return (
    <Link href={`/${malType}/${id}`}>
      <a className="block w-28 transition hover:scale-110 md:w-44">
        <div className="relative aspect-[225/350] w-full">
          <Image
            className="h-full w-full rounded-md object-cover"
            layout="fill"
            src={img}
            alt={title}
          />
        </div>
        <div className="line-clamp-2">{title}</div>
      </a>
    </Link>
  )
}

export default SeasonalEntry
