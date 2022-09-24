import Client from 'Client'
import AutoSuggestInput from 'components/AutoSuggestInput'
import EmptyImage from 'components/EmptyImage'
import { isEmpty } from 'lodash'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { SearchResult } from 'types/common'

type AnimeSeriesAutoSuggestInputProps = {
  className?: string
}

const AnimeSeriesAutoSuggestInput = ({ className }: AnimeSeriesAutoSuggestInputProps) => {
  const router = useRouter()

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
            className={`grid grid-cols-[min-content_minmax(0,1fr)] items-center border-b border-gray-200 py-2 px-4 text-left w-full ${
              highlight ? 'bg-gray-300' : ''
            }`}
          >
            <div className="relative w-12 aspect-square mr-2">
              {isEmpty(thumbnail) ? (
                <EmptyImage rounded="rounded-full" />
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
              <div className="text-ellipsis overflow-hidden whitespace-nowrap">{name}</div>
              <div className="text-neutral-500">{type}</div>
            </div>
          </div>
        )
      }}
    />
  )
}

export default AnimeSeriesAutoSuggestInput
