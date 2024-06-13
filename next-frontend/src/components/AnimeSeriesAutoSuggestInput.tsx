import { Text } from '@mantine/core'
import { useHotkeys, useOs } from '@mantine/hooks'
import Client from 'Client'
import AutoSuggestInput from 'components/AutoSuggestInput'
import EmptyImage from 'components/EmptyImage'
import Skeleton from 'components/Skeleton'
import useCheckMobile from 'hooks/useCheckMobile'
import { isEmpty } from 'lodash'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useRef, useState } from 'react'
import { SearchResult } from 'types/common'

type AnimeSeriesAutoSuggestInputProps = {
  className?: string
}

const AnimeSeriesAutoSuggestInput = ({ className }: AnimeSeriesAutoSuggestInputProps) => {
  const router = useRouter()
  const os = useOs()
  const isMobile = useCheckMobile()

  const [defaultSuggestions, setDefaultSuggestions] = useState<SearchResult[]>([])
  useEffect(() => {
    const fetchDefaultSuggestions = async () => {
      const { data } = await Client.searchSeasonal()
      setDefaultSuggestions(
        data.map(({ malType, id, title, img }) => ({
          malType,
          id: String(id),
          name: title,
          type: 'TV',
          thumbnail: img,
        })),
      )
    }

    fetchDefaultSuggestions()
  }, [])

  const inputRef = useRef<HTMLInputElement>(null)
  useHotkeys([['mod + K', () => inputRef.current?.focus()]])

  const onFetch = useCallback(async (str: string) => {
    const result = await Client.search(str, 10)
    return result.map(({ name, ...rest }) => ({
      suggestion: name,
      name,
      ...rest,
    }))
  }, [])

  const shouldStartFetching = useCallback((str: string) => str.length > 2, [])

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
    <div className="w-full">
      <AutoSuggestInput<SearchResult>
        inputRef={inputRef}
        className={`${className}`}
        defaultSuggestions={defaultSuggestions.map(({ name, ...rest }) => ({
          suggestion: name,
          name,
          ...rest,
        }))}
        onSuggestionSelect={({ malType, id }) => router.push(`/${malType}/${id}`)}
        onFetch={onFetch}
        placeholder="Search anime..."
        shouldStartFetching={shouldStartFetching}
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
        renderRightSection={({ isInputActive }) => {
          return (
            !isMobile &&
            !isInputActive && (
              <div
                className={`-my-1 -mr-3 flex h-min gap-1 rounded border bg-gray-100 px-2 py-0.5`}
              >
                <p className="text-sm font-medium">{os === 'macos' ? '⌘ + K' : 'Ctrl + K'}</p>
              </div>
            )
          )
        }}
        renderDefaultSuggestionsHeader={() => {
          return (
            <Text className="px-4 py-1" c="dimmed">
              This anime season
            </Text>
          )
        }}
      />

      <div className="flex items-center py-1">
        <div className="ml-auto">
          <Link href="https://forms.gle/xEJS6iq6epgyYxdM8">
            <a className="web-link text-sm" target="_blank">
              Feedback
            </a>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default AnimeSeriesAutoSuggestInput
