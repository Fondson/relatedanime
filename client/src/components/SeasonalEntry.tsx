import { Link } from 'react-router-dom'

function SeasonalEntry({ data }) {
  const { img, title, malType, id } = data
  return (
    <Link className="block w-28 transition hover:scale-110 md:w-44" to={`${malType}/${id}`}>
      <div className="aspect-[225/350] w-full">
        <img className="h-full w-full rounded-md object-cover" src={img} alt={title} />
      </div>
      <div className="line-clamp-2">{title}</div>
    </Link>
  )
}

export default SeasonalEntry
