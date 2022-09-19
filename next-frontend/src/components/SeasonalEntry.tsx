import EntryImage from 'components/EntryImage'
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
        <EntryImage src={img} alt={title} />
        <div className="line-clamp-2 pt-2" title={title}>
          {title}
        </div>
      </a>
    </Link>
  )
}

export default SeasonalEntry
