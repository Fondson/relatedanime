import kirinoMouse from 'media/kirino-mouse.gif'

function LoadingPage({ loadingString }) {
  return (
    <div className="mx-auto mt-10 w-8/12">
      <img className="mx-auto rounded-xl pb-2" src={kirinoMouse} alt="Loading..." />
      <p className="px-6 text-center">{loadingString}</p>
    </div>
  )
}

export default LoadingPage
