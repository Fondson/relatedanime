import { IconHome } from '@tabler/icons-react'
import Link from 'next/link'

const HomeButton = () => {
  return (
    <Link href="/">
      <div className="relative mr-5 w-10 flex-none transition-all hover:brightness-50">
        <IconHome className="h-full w-full" />
      </div>
    </Link>
  )
}

export default HomeButton
