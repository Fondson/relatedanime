import ImageIcon from 'icons/image.svg'
import { isEmpty } from 'lodash'
import Image, { ImageProps } from 'next/image'

type EntryImageProps = ImageProps

const EntryImage = ({ src, alt = '', ...rest }: EntryImageProps) => {
  return (
    <div className="relative aspect-[225/350] w-full">
      {!isEmpty(src) ? (
        <Image className="rounded-md object-cover" src={src} alt={alt} layout="fill" {...rest} />
      ) : (
        <div className="rounded-md w-full h-full border border-gray-400">
          <div className="w-1/2 relative h-full mx-auto">
            <Image src={ImageIcon} alt={alt} layout="fill" {...rest} />
          </div>
        </div>
      )}
    </div>
  )
}
export default EntryImage
