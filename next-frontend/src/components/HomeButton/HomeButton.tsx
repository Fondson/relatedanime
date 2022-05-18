import HomeIcon from 'icons/home.svg'
import Image from 'next/image'
import Link from 'next/link'

const HomeButton = () => {
  return (
    <Link href="/">
      <a className="relative mr-5 w-10 flex-none transition-all hover:brightness-50">
        <Image layout="fill" src={HomeIcon} alt="Home" />
      </a>
    </Link>
  )
}

export default HomeButton
