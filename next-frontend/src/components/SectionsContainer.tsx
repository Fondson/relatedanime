import GroupedEntryView from 'components/GroupedEntryView'
import TimelineEntryView from 'components/TimelineEntryView'
import ViewOptionsButton, { View } from 'components/ViewOptionsButton'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import { AnimeItemsByType } from 'types/common'

type SectionsContainerProps = {
  animes: AnimeItemsByType
}

function SectionsContainer({ animes }: SectionsContainerProps) {
  const router = useRouter()
  const {
    view: viewFromQuery,
    mediaTypesFilter: mediaTypesFilterFromQuery,
  }: { view?: View; mediaTypesFilter?: string } = router.query

  const [view, setView] = useState<View | undefined>()
  const [mediaTypeFilters, setMediaTypeFilters] = useState<string[] | undefined>()

  const onViewChange = useCallback(
    (view: View) => {
      router.push({ pathname: router.pathname, query: { ...router.query, view } }, undefined, {
        shallow: true,
      })
      setView(view)
    },
    [router],
  )

  const onSelectedMediaTypesChange = useCallback(
    (mediaTypes: string[]) => {
      router.push({
        pathname: router.pathname,
        query: { ...router.query, mediaTypesFilter: JSON.stringify(mediaTypes) },
      })
      setMediaTypeFilters(mediaTypes)
    },
    [router],
  )

  useEffect(() => {
    if (router.isReady) {
      setView(viewFromQuery ?? 'grouped')
      setMediaTypeFilters(mediaTypesFilterFromQuery && JSON.parse(mediaTypesFilterFromQuery))
    }
  }, [viewFromQuery, mediaTypesFilterFromQuery, router])

  return (
    <>
      <div className="flex w-full">
        <div className="ml-auto">
          {view && (
            <ViewOptionsButton
              defaultView={view}
              onViewChange={onViewChange}
              animes={animes}
              defaultSelectedMediaTypes={mediaTypeFilters}
              onSelectedMediaTypesChange={onSelectedMediaTypesChange}
            />
          )}
        </div>
      </div>

      {view === 'grouped' && (
        <GroupedEntryView animes={animes} mediaTypeFilters={mediaTypeFilters} />
      )}
      {view === 'timeline' && (
        <TimelineEntryView animes={animes} mediaTypeFilters={mediaTypeFilters} />
      )}
    </>
  )
}

export default SectionsContainer
