import ImageIcon from 'icons/image.svg'
import Image from 'next/image'

type EmptyImageProps = React.HTMLAttributes<HTMLDivElement> & {
  imageWidth?: string
}

const EmptyImage = ({ imageWidth = 'w-1/2', className, ...rest }: EmptyImageProps) => {
  return (
    <div className={`w-full h-full border border-gray-400 ${className}`} {...rest}>
      <div className={`${imageWidth ?? ''} relative h-full mx-auto transition-all`}>
        <Image src={ImageIcon} layout="fill" alt="" />
      </div>
    </div>
  )
}

export default EmptyImage
