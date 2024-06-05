import Spinner from 'components/Spinner'
import debounce from 'debounce-promise'
import React, { createRef, useCallback, useEffect, useMemo, useRef, useState } from 'react'

const defaultDebounceTime = 1000

type Suggestion<T> = T & {
  suggestion: string
}

type RenderSuggestion<T> = (suggestion: Suggestion<T>, highlight: boolean) => React.ReactNode

type AutoSuggestInputProps<T> = Partial<React.InputHTMLAttributes<HTMLInputElement>> & {
  onSuggestionSelect: (value: T) => void
  onFetch: (searchStr: string) => Promise<Suggestion<T>[]>
  initialValue?: string
  placeholder?: string
  className?: string
  clearOnBlur?: boolean
  shouldStartFetching?: (searchStr: string) => boolean
  renderCustonSuggestionButton?: RenderSuggestion<T>
  renderCustomLoader?: () => React.ReactNode
}

export default function AutoSuggestInput<T>({
  onSuggestionSelect,
  onFetch,
  initialValue = '',
  placeholder = '',
  className = '',
  clearOnBlur = false,
  shouldStartFetching = () => true,
  renderCustonSuggestionButton,
  renderCustomLoader,
  ...rest
}: AutoSuggestInputProps<T>) {
  const [searchStr, setSearchStr] = useState(initialValue)
  const [loading, setLoading] = useState(false)
  useEffect(() => setSearchStr(initialValue), [initialValue])

  const debouncedOnFetch = useMemo(
    () => debounce(onFetch, defaultDebounceTime, { leading: true }),
    [onFetch],
  )

  const [suggestions, setSuggestions] = useState<Suggestion<T>[]>([])
  const [highlight, setHighlight] = useState<number | null>(null)
  const [isActive, setIsActive] = useState(false)
  const shouldShowDropdown = isActive && shouldStartFetching(searchStr)

  const updateSuggestions = useCallback(
    async (str: string) => {
      if (shouldStartFetching(str)) {
        setLoading(true)
        debouncedOnFetch(str).then((suggestions: Suggestion<T>[]) => {
          setSuggestions(suggestions)
          setHighlight(suggestions.length > 0 ? 0 : null)
          setLoading(false)
        })
      } else {
        setSuggestions([])
        setHighlight(null)
      }
    },
    [debouncedOnFetch, shouldStartFetching],
  )

  const listOptionsDivRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (listOptionsDivRef.current == null) return
    listOptionsDivRef.current.scrollTop = 0
  }, [searchStr])

  const setSelected = (highlightOverride?: number) => {
    const selectedSuggestionIndex = highlightOverride ?? highlight
    if (selectedSuggestionIndex != null) {
      onSuggestionSelect(suggestions[selectedSuggestionIndex])
    }
    setSearchStr('')
    setSuggestions([])
    setHighlight(null)
  }

  const suggestionButtonsRefs: React.RefObject<HTMLButtonElement>[] = Array.from(
    { length: suggestions.length },
    () => createRef(),
  )
  useEffect(() => {
    if (highlight == null) return
    suggestionButtonsRefs[highlight]?.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    })
  }, [highlight, suggestionButtonsRefs])

  return (
    <div className="relative w-full text-black">
      <div className="block w-full">
        <input
          className={`px-4 ${shouldShowDropdown ? 'rounded-b-none' : ''} ${className}`}
          placeholder={placeholder}
          value={searchStr}
          onChange={(event) => {
            const str = event.target.value
            setSearchStr(str)
            updateSuggestions(str)
          }}
          onFocus={() => {
            setIsActive(true)
            updateSuggestions(searchStr)
          }}
          onBlur={() => {
            if (clearOnBlur) {
              setSearchStr('')
            }

            setIsActive(false)
            setHighlight(null)
            setSuggestions([])
          }}
          onKeyDown={(event) => {
            switch (event.code) {
              case 'ArrowDown':
                event.preventDefault()
                setHighlight((prev) => Math.min((prev ?? -1) + 1, suggestions.length - 1))
                break
              case 'ArrowUp':
                event.preventDefault()
                setHighlight((prev) => Math.max((prev ?? suggestions.length) - 1, 0))
                break
              case 'Enter':
                event.preventDefault()
                if (highlight !== null) {
                  setSelected()
                }
                break
              default:
            }
          }}
          {...rest}
        />
      </div>
      <div
        ref={listOptionsDivRef}
        className={`border-1 absolute z-10 flex max-h-[50vh] w-full flex-col overflow-y-auto rounded-b-md border-gray-100 bg-white shadow-md ${
          !shouldShowDropdown ? 'hidden' : ''
        }`}
      >
        {suggestions.length === 0 || loading ? (
          renderCustomLoader ? (
            renderCustomLoader()
          ) : (
            <div className="flex py-2 px-4 pr-2 text-left">
              <div className="pr-2">Loading...</div>
              <Spinner />
            </div>
          )
        ) : (
          suggestions.map((suggestion, i) => {
            const isHighligted = highlight === i
            return (
              <button
                key={i}
                ref={suggestionButtonsRefs[i]}
                onMouseDown={(e) => e.preventDefault()} /* https://stackoverflow.com/a/57630197 */
                onClick={() => setSelected(i)}
                onMouseMove={() => setHighlight(i)}
                type="button"
              >
                {renderCustonSuggestionButton
                  ? renderCustonSuggestionButton(suggestion, isHighligted)
                  : renderSuggestionButton(suggestion, isHighligted)}
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}

const renderSuggestionButton: RenderSuggestion<Suggestion<unknown>> = (
  { suggestion },
  highlight,
) => {
  return (
    <div
      className={`block w-full border-b border-gray-200 py-2 px-4 pr-2 text-left ${
        highlight ? 'bg-gray-300' : ''
      }`}
    >
      {suggestion}
    </div>
  )
}
