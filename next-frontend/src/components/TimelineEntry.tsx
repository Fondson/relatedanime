import EntryImage from 'components/EntryImage'
import useCheckMobile from 'hooks/useCheckMobile'
import Link from 'next/link'
import { AnimeItem } from 'types/common'

type TimelineEntryProps = {
  data: AnimeItem
}

function TimelineEntry({ data }: TimelineEntryProps) {
  const { image, title, link, startDate } = data
  const isMobile = useCheckMobile()

  return (
    <Link href={link}>
      <a className={`horizontal group grid grid-cols-3 gap-2`} target="_blank">
        <EntryImage src={image} alt={title} unoptimized className={`col-span-1`} />
        <div className={`col-span-2 ${!isMobile ? 'transition group-hover:brightness-[.8]' : ''}`}>
          <div title={title}>{title}</div>
          <div className="italic text-gray-200">{startDate}</div>
        </div>
      </a>
    </Link>
  )
}

export default TimelineEntry
