import EmptyImage from 'components/EmptyImage'
import { isEmpty } from 'lodash'
import Image, { ImageProps } from 'next/image'

type EntryImageProps = ImageProps

const EntryImage = ({ src, alt = '', className, ...rest }: EntryImageProps) => {
  return (
    <div className={`relative aspect-[225/350] w-full rounded-md overflow-hidden ${className}`}>
      {!isEmpty(src) ? (
        <Image
          className="object-cover transition group-hover:scale-110"
          src={src}
          alt={alt}
          layout="fill"
          {...rest}
        />
      ) : (
        <EmptyImage />
      )}
    </div>
  )
}
export default EntryImage
