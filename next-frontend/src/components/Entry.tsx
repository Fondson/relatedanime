import EntryImage from 'components/EntryImage'
import useCheckMobile from 'hooks/useCheckMobile'
import Link from 'next/link'
import { AnimeItem } from 'types/common'

type EntryProps = {
  data: AnimeItem
  layout?: 'vertical' | 'horizontal'
}

function Entry({ data, layout = 'vertical' }: EntryProps) {
  const { image, title, link, startDate } = data
  const isMobile = useCheckMobile()

  return (
    <Link href={link}>
      <a className={`group block ${layout === 'horizontal' ? 'grid grid-cols-3 gap-2' : ''}`}>
        <EntryImage
          src={image}
          alt={title}
          unoptimized
          className={`${layout === 'horizontal' ? 'col-span-1' : ''}`}
        />
        <div
          className={`${layout === 'horizontal' ? 'col-span-2' : ''} ${
            !isMobile ? 'transition group-hover:brightness-[.8]' : ''
          }`}
        >
          <div className={`${layout === 'horizontal' ? '' : 'pt-2'} line-clamp-2`} title={title}>
            {title}
          </div>
          <div className="italic text-gray-200">{startDate}</div>
        </div>
      </a>
    </Link>
  )
}

export default Entry
