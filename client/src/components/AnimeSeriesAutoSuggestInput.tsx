import Client from 'Client'
import AutoSuggestInput from 'components/AutoSuggestInput'
import { useNavigate } from 'react-router-dom'
import { MalIdentifier } from 'types/common'

type AnimeSeriesAutoSuggestInputProps = {
  className?: string
}

const AnimeSeriesAutoSuggestInput = ({ className }: AnimeSeriesAutoSuggestInputProps) => {
  const navigate = useNavigate()

  return (
    <AutoSuggestInput<MalIdentifier>
      className={`w-full rounded-md py-2 outline-none ${className}`}
      onSuggestionSelect={({ malType, malId }) => navigate(`/${malType}/${malId}`)}
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
