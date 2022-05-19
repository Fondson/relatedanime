import EntryImage from 'components/EntryImage'
import { AnimeItem } from 'types/common'

type EntryProps = {
  data: AnimeItem
}

function Entry({ data }: EntryProps) {
  const { image, title, link, startDate } = data
  return (
    <a className="block transition hover:scale-110" href={link} title={title}>
      <EntryImage src={image} alt={title} />
      <div className="line-clamp-2 pt-2">{title}</div>
      <div className="italic text-gray-200">{startDate}</div>
    </a>
  )
}

export default Entry
