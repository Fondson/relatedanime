import kirinoMouse from 'media/kirino-mouse.gif'
import Image from 'next/image'

type LoadingPageProps = {
  loadingString: string
}

const LoadingPage = ({ loadingString }: LoadingPageProps) => {
  return (
    <div className="mx-auto mt-10 px-6 md:w-1/2">
      <div className="flex justify-center pb-2">
        <Image className="rounded-xl" src={kirinoMouse} alt="Loading..." />
      </div>
      <p className="whitespace-pre-line">{loadingString}</p>
    </div>
  )
}

export default LoadingPage
