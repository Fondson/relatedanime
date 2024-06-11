import Spinner from 'components/Spinner'
import debounce from 'debounce-promise'
import React, { createRef, useCallback, useEffect, useMemo, useRef, useState } from 'react'

const defaultDebounceTime = 1000

type Suggestion<T> = T & {
  suggestion: string
}

type RenderSuggestion<T> = (suggestion: Suggestion<T>, highlight: boolean) => React.ReactNode

type RenderSectionFunction = ({ isInputActive }: { isInputActive: boolean }) => React.ReactNode

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
  renderLeftSection?: RenderSectionFunction
  renderRightSection?: RenderSectionFunction
  inputRef?: React.RefObject<HTMLInputElement>
  defaultSuggestions?: Suggestion<T>[]
  renderDefaultSuggestionsHeader?: () => React.ReactNode
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
  renderLeftSection,
  renderRightSection,
  inputRef: inputRefProp,
  defaultSuggestions = [],
  renderDefaultSuggestionsHeader,
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
  const shouldShowDropdown =
    isActive && (shouldStartFetching(searchStr) || defaultSuggestions.length > 0)

  const localInputRef = useRef<HTMLInputElement>(null)
  const inputRef = inputRefProp ?? localInputRef

  const suggestionsToShow = useMemo(
    () => (searchStr.length === 0 ? defaultSuggestions : suggestions),
    [defaultSuggestions, searchStr.length, suggestions],
  )

  const updateSuggestions = useCallback(
    async (str: string) => {
      if (shouldStartFetching(str)) {
        setLoading(true)
        debouncedOnFetch(str).then((_suggestions: Suggestion<T>[]) => {
          setSuggestions(_suggestions)
          setHighlight(_suggestions.length > 0 ? 0 : null)
          setLoading(false)
        })
      } else {
        setSuggestions([])
        setHighlight(suggestionsToShow.length - 1 >= 0 ? 0 : null)
      }
    },
    [debouncedOnFetch, shouldStartFetching, suggestionsToShow.length],
  )

  const listOptionsDivRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (listOptionsDivRef.current == null) return
    listOptionsDivRef.current.scrollTop = 0
  }, [searchStr])

  const setSelected = useCallback(
    (highlightOverride?: number) => {
      const selectedSuggestionIndex = highlightOverride ?? highlight
      if (selectedSuggestionIndex != null) {
        onSuggestionSelect(suggestionsToShow[selectedSuggestionIndex])
      }
      setSearchStr('')
      setSuggestions([])
      setHighlight(null)
      setIsActive(false)
    },
    [highlight, onSuggestionSelect, suggestionsToShow],
  )

  const suggestionButtonsRefs: React.RefObject<HTMLButtonElement>[] = Array.from(
    { length: suggestionsToShow.length },
    () => createRef(),
  )
  useEffect(() => {
    if (highlight == null) return
    suggestionButtonsRefs[highlight]?.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    })
  }, [highlight, suggestionButtonsRefs])

  const renderSuggestions = useCallback(
    (suggestion: Suggestion<T>, i: number) => {
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
    },
    [highlight, suggestionButtonsRefs, renderCustonSuggestionButton, setSelected],
  )

  return (
    <div className="relative w-full text-black">
      <div className="block w-full">
        <div
          className={`flex w-full items-center rounded-md border-2 bg-white py-1.5 px-4 ${
            shouldShowDropdown
              ? 'rounded-b-none'
              : isActive
              ? 'border-blue-600'
              : 'border-slate-300'
          } ${className}`}
          onClick={() => {
            inputRef.current?.focus()
          }}
        >
          {renderLeftSection?.({ isInputActive: isActive })}
          <input
            ref={inputRef}
            className="grow bg-inherit outline-none"
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
                  setHighlight((prev) => Math.min((prev ?? -1) + 1, suggestionsToShow.length - 1))
                  break
                case 'ArrowUp':
                  event.preventDefault()
                  setHighlight((prev) => Math.max((prev ?? suggestionsToShow.length) - 1, 0))
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
            spellCheck={false}
            {...rest}
          />
          {renderRightSection?.({ isInputActive: isActive })}
        </div>
      </div>
      <div
        ref={listOptionsDivRef}
        className={`border-1 absolute z-10 flex max-h-[50vh] w-full flex-col overflow-y-auto rounded-b-md border-gray-100 bg-white shadow-md ${
          !shouldShowDropdown ? 'hidden' : ''
        }`}
      >
        {loading ? (
          renderCustomLoader ? (
            renderCustomLoader()
          ) : (
            <div className="flex py-2 px-4 pr-2 text-left">
              <div className="pr-2">Loading...</div>
              <Spinner />
            </div>
          )
        ) : (
          <>
            {searchStr.length === 0 && renderDefaultSuggestionsHeader?.()}
            {suggestionsToShow.map(renderSuggestions)}
          </>
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
