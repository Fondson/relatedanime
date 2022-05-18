import Image from 'next/image'
import { AnimeItem } from 'types/common'

type EntryProps = {
  data: AnimeItem
}

function Entry({ data }: EntryProps) {
  const { image, title, link, startDate } = data
  return (
    <a className="block transition hover:scale-110" href={link}>
      <div className="relative aspect-[225/350] w-full">
        <Image className="rounded-md object-cover" src={image} alt={title} layout="fill" />
      </div>
      <div className="line-clamp-2">{title}</div>
      <div className="italic text-gray-200">{startDate}</div>
    </a>
  )
}

export default Entry
