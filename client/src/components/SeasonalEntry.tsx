import 'components/Entry.css'
import 'components/SeasonalEntry.css'

function SeasonalEntry({ data }) {
  const { img, title, malType, id } = data
  const link = malType + '/' + id
  return (
    <td>
      <div className="entry seasonal-entry">
        <a href={link} rel="noopener noreferrer">
          <img src={img} alt={title} />
          <div className="wrap-text">
            <div className="seasonal-title">{title}</div>
          </div>
        </a>
      </div>
    </td>
  )
}

export default SeasonalEntry
