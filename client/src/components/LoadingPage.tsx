import kirinoMouse from '../media/kirino-mouse.gif'

import React from 'react'

function LoadingPage({ loadingString }) {
  return (
    <div className="loading-container">
      <span>
        <img className="loading" src={kirinoMouse} alt="Loading..." />
        <p style={{ paddingRight: '1.5em', paddingLeft: '1.5em', textAlign: 'center' }}>
          {loadingString}
        </p>
      </span>
    </div>
  )
}

export default LoadingPage
