import debounce from 'lodash/debounce'
import { useEffect, useMemo, useRef } from 'react'

type FancyScrollbarContainerProps = Partial<React.HTMLAttributes<HTMLDivElement>> & {
  children: React.ReactNode
  passRef?: React.MutableRefObject<HTMLDivElement | undefined>
  hide?: boolean
}

const FancyScrollbarContainer = ({
  children,
  className = '',
  passRef = undefined,
  onScroll = () => {
    return
  },
  hide = true,
  ...rest
}: FancyScrollbarContainerProps) => {
  const ref = useRef<HTMLDivElement>()
  useEffect(() => {
    if (passRef == null) return
    ref.current = passRef.current
  }, [passRef])
  const debouncedHideScrollbar = useMemo(
    () => debounce(() => ref.current?.classList?.remove('.show-scrollbar'), 750),
    [ref],
  )

  return (
    <div
      ref={(passRef ?? ref) as React.RefObject<HTMLDivElement>}
      className={`fancy-scrollbar-container ${
        hide ? 'fancy-scrollbar-container-without-width' : 'fancy-scrollbar-container-always-show'
      } ${className}`}
      onScroll={(e) => {
        onScroll(e)

        // inspired by https://stackoverflow.com/a/68416028
        ref.current?.classList?.add('.show-scrollbar')
        if (hide) debouncedHideScrollbar()
      }}
      {...rest}
    >
      {children}
    </div>
  )
}

export default FancyScrollbarContainer
