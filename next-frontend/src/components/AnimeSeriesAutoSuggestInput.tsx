import Client from 'Client'
import AutoSuggestInput from 'components/AutoSuggestInput'
import { useRouter } from 'next/router'
import { MalIdentifier } from 'types/common'

type AnimeSeriesAutoSuggestInputProps = {
  className?: string
}

const AnimeSeriesAutoSuggestInput = ({ className }: AnimeSeriesAutoSuggestInputProps) => {
  const router = useRouter()

  return (
    <AutoSuggestInput<MalIdentifier>
      className={`w-full rounded-md py-2 outline-none ${className}`}
      onSuggestionSelect={({ malType, malId }) => router.push(`/${malType}/${malId}`)}
      onFetch={async (str) => {
        const result = await Client.searchWithoutCb(str, 5)
        return result.map(({ name, malType, id }) => ({
          suggestion: name,
          malType,
          malId: id,
        }))
      }}
      placeholder="Search anime..."
      shouldStartFetching={(str) => str.length > 2}
    />
  )
}

export default AnimeSeriesAutoSuggestInput