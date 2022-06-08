import kirinoMouse from 'media/kirino-mouse.gif'
import Image from 'next/image'

type LoadingPageProps = {
  loadingString: string
}

const LoadingPage = ({ loadingString }: LoadingPageProps) => {
  return (
    <div className="mx-auto mt-10 w-8/12">
      <div className="flex justify-center pb-2">
        <Image className="rounded-xl" src={kirinoMouse} alt="Loading..." />
      </div>
      <p className="px-6 text-center">{loadingString}</p>
    </div>
  )
}

export default LoadingPage
