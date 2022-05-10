import { Table } from 'react-bootstrap'
import SeasonalEntry from 'components/SeasonalEntry'
import 'components/SeasonalSection.css'
import 'components/Section.css'

function SeasonalSection({ animes }) {
  return (
    <div className="seasonal-section">
      <h3 className="seasonal-header">{'Currently Airing'}</h3>
      <Table bsClass="table" responsive>
        <tbody>
          <tr>
            {animes.map((anime) => {
              return <SeasonalEntry data={anime} key={anime.malType + anime.id} />
            })}
          </tr>
        </tbody>
      </Table>
    </div>
  )
}

export default SeasonalSection
