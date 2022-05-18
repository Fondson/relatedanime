import ImageIcon from 'icons/image.svg'
import { isEmpty } from 'lodash'
import Image, { StaticImageData } from 'next/image'

type EntryImageProps = {
  src: string | StaticImageData
  alt: string
}

const EntryImage = ({ src, alt }: EntryImageProps) => {
  return !isEmpty(src) ? (
    <Image className="rounded-md object-cover" src={src} alt={alt} layout="fill" />
  ) : (
    <div className="rounded-md w-full h-full border border-gray-400">
      <div className="w-1/2 relative h-full mx-auto">
        <Image src={ImageIcon} alt={alt} layout="fill" />
      </div>
    </div>
  )
}
export default EntryImage
