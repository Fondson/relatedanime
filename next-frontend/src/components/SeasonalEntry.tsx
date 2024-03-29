import EntryImage from 'components/EntryImage'
import useCheckMobile from 'hooks/useCheckMobile'
import Link from 'next/link'
import { SeasonalAnimeItem } from 'types/common'

type SeasonalEntryProps = {
  data: SeasonalAnimeItem
}

function SeasonalEntry({ data }: SeasonalEntryProps) {
  const { img, title, malType, id } = data
  const isMobile = useCheckMobile()

  return (
    <Link href={`/${malType}/${id}`}>
      <a className="group block w-28 md:w-44">
        <EntryImage src={img} alt={title} />
        <div
          className={`line-clamp-2 pt-2 ${
            !isMobile ? 'transition group-hover:brightness-[.8]' : ''
          }`}
          title={title}
        >
          {title}
        </div>
      </a>
    </Link>
  )
}

export default SeasonalEntry
