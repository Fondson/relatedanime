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
          rounded="rounded-md"
          className={!isMobile ? 'transition group-hover:brightness-75' : ''}
        />
      )}
    </div>
  )
}
export default EntryImage
