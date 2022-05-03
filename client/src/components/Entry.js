import React from 'react'

import './Entry.css'

function Entry({ data }) {
  const { title, link, image, startDate } = data
  return (
    <td>
      <div className="entry">
        <a href={link} rel="noopener noreferrer" target="_blank">
          <img src={image} alt={title} />
          <div className="wrap-text">
            <span>{title}</span>
          </div>
          <p>{startDate}</p>
        </a>
      </div>
    </td>
  )
}

export default Entry
