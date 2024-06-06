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
  const { view: viewFromQuery }: { view?: View } = router.query

  const [view, setView] = useState<View | undefined>()

  const onViewChange = useCallback(
    (view: View) => {
      router.push({ pathname: router.pathname, query: { ...router.query, view } }, undefined, {
        shallow: true,
      })
      setView(view)
    },
    [router],
  )

  useEffect(() => {
    if (router.isReady) {
      setView(viewFromQuery ?? 'grouped')
    }
  }, [viewFromQuery, router])

  return (
    <>
      <div className="flex w-full">
        <div className="ml-auto">
          {view && <ViewOptionsButton defaultView={view} onViewChange={onViewChange} />}
        </div>
      </div>

      {view === 'grouped' && <GroupedEntryView animes={animes} />}
      {view === 'timeline' && <TimelineEntryView animes={animes} />}
    </>
  )
}

export default SectionsContainer
