import Client from 'Client'
import AutoSuggestInput from 'components/AutoSuggestInput'
import EmptyImage from 'components/EmptyImage'
import Skeleton from 'components/Skeleton'
import { isEmpty } from 'lodash'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { SearchResult } from 'types/common'

type AnimeSeriesAutoSuggestInputProps = {
  className?: string
}

const AnimeSeriesAutoSuggestInput = ({ className }: AnimeSeriesAutoSuggestInputProps) => {
  const router = useRouter()

  const SuggestionSkeleton = () => {
    return (
      <div className="grid w-full grid-cols-[min-content_minmax(0,1fr)] items-center border-b border-gray-200 py-2 px-4">
        <Skeleton className="mr-2 aspect-square w-12 rounded-full" />
        <div className="flex w-full flex-col gap-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      </div>
    )
  }

  return (
    <AutoSuggestInput<SearchResult>
      className={`w-full rounded-md py-2 outline-none ${className}`}
      onSuggestionSelect={({ malType, id }) => router.push(`/${malType}/${id}`)}
      onFetch={async (str) => {
        const result = await Client.search(str, 10)
        return result.map(({ name, ...rest }) => ({
          suggestion: name,
          name,
          ...rest,
        }))
      }}
      placeholder="Search anime..."
      shouldStartFetching={(str) => str.length > 2}
      renderCustonSuggestionButton={({ name, thumbnail, type }, highlight) => {
        return (
          <div
            className={`grid w-full grid-cols-[min-content_minmax(0,1fr)] items-center border-b border-gray-200 py-2 px-4 text-left ${
              highlight ? 'bg-gray-300' : ''
            }`}
          >
            <div className="relative mr-2 aspect-square w-12">
              {isEmpty(thumbnail) ? (
                <EmptyImage className="rounded-full" />
              ) : (
                <Image
                  className="rounded-full object-cover"
                  src={thumbnail as string}
                  unoptimized
                  alt={name}
                  layout="fill"
                />
              )}
            </div>

            <div>
              <div className="overflow-hidden text-ellipsis whitespace-nowrap">{name}</div>
              <div className="text-neutral-500">{type}</div>
            </div>
          </div>
        )
      }}
      renderCustomLoader={() => {
        return (
          <>
            {Array.from({ length: 10 }).map((_, i) => (
              <SuggestionSkeleton key={i} />
            ))}
          </>
        )
      }}
    />
  )
}

export default AnimeSeriesAutoSuggestInput
