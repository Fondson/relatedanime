import React from 'react'
import { Table } from 'react-bootstrap'
import Entry from './Entry'
import './Section.css'

function Section({ data }) {
  return (
    <div>
      <h1>{data.header}</h1>
      <Table bsClass="table" responsive>
        <tbody>
          <tr>
            {data.animes.map((anime) => {
              return <Entry data={anime} key={anime.type + anime.title} />
            })}
          </tr>
        </tbody>
      </Table>
    </div>
  )
}

export default Section
