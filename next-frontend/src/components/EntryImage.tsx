import EmptyImage from 'components/EmptyImage'
import useCheckMobile from 'hooks/useCheckMobile'
import { isEmpty } from 'lodash'
import Image, { ImageProps } from 'next/image'

type EntryImageProps = ImageProps

const EntryImage = ({ src, alt = '', className, ...rest }: EntryImageProps) => {
  const isMobile = useCheckMobile()

  return (
    <div className={`relative aspect-[225/350] w-full rounded-md overflow-hidden ${className}`}>
      {!isEmpty(src) ? (
        <Image
          className={`object-cover ${!isMobile ? 'transition group-hover:scale-110' : ''}`}
          src={src}
          alt={alt}
          layout="fill"
          {...rest}
        />
      ) : (
        <EmptyImage
          className={`rounded-md`}
          imageWidth={isMobile ? undefined : 'w-1/2 group-hover:w-[55%]'}
        />
      )}
    </div>
  )
}
export default EntryImage
