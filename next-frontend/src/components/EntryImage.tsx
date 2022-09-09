import EmptyImage from 'components/EmptyImage'
import { isEmpty } from 'lodash'
import Image, { ImageProps } from 'next/image'

type EntryImageProps = ImageProps

const EntryImage = ({ src, alt = '', ...rest }: EntryImageProps) => {
  return (
    <div className="relative aspect-[225/350] w-full">
      {!isEmpty(src) ? (
        <Image className="rounded-md object-cover" src={src} alt={alt} layout="fill" {...rest} />
      ) : (
        <EmptyImage />
      )}
    </div>
  )
}
export default EntryImage
