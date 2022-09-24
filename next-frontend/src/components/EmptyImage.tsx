import ImageIcon from 'icons/image.svg'
import Image, { ImageProps } from 'next/image'

type EmptyImageProps = Omit<ImageProps, 'src' | 'layout'> & {
  rounded?: 'rounded-md' | 'rounded-full'
}

const EmptyImage = ({ rounded, ...rest }: EmptyImageProps) => {
  return (
    <div className={`${rounded ?? ''} w-full h-full border border-gray-400`}>
      <div className="w-1/2 relative h-full mx-auto">
        <Image src={ImageIcon} layout="fill" alt="" {...rest} />
      </div>
    </div>
  )
}

export default EmptyImage
