import EntryImage from 'components/EntryImage'
import Link from 'next/link'
import { AnimeItem } from 'types/common'

type EntryProps = {
  data: AnimeItem
}

function Entry({ data }: EntryProps) {
  const { image, title, link, startDate } = data
  return (
    <Link href={link}>
      <a className="block group">
        <EntryImage src={image} alt={title} unoptimized />
        <div className="transition group-hover:brightness-[.8]">
          <div className="line-clamp-2 pt-2" title={title}>
            {title}
          </div>
          <div className="italic text-gray-200">{startDate}</div>
        </div>
      </a>
    </Link>
  )
}

export default Entry
