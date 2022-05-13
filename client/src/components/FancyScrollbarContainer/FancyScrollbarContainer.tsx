import 'components/FancyScrollbarContainer/FancyScrollbarContainer.css'

import debounce from 'lodash/debounce'
import { useEffect, useMemo, useRef } from 'react'

type FancyScrollbarContainerProps = Partial<React.HTMLAttributes<HTMLDivElement>> & {
  children: React.ReactNode
  passRef?: React.MutableRefObject<HTMLDivElement>
}

const FancyScrollbarContainer = ({
  children,
  className = '',
  passRef = undefined,
  onScroll = () => {},
  ...rest
}: FancyScrollbarContainerProps) => {
  const ref = useRef<HTMLDivElement>()
  useEffect(() => {
    if (passRef == null) return
    ref.current = passRef.current
  }, [passRef])
  const debouncedHideScrollbar = useMemo(
    () => debounce(() => ref.current.classList.remove('show-scrollbar'), 500),
    [ref],
  )

  return (
    <div
      ref={passRef ?? ref}
      className={`fancy-scrollbar-container ${className}`}
      onScroll={(e) => {
        onScroll(e)

        // inspired by https://stackoverflow.com/a/68416028
        ref.current.classList.add('show-scrollbar')
        debouncedHideScrollbar()
      }}
      {...rest}
    >
      {children}
    </div>
  )
}

export default FancyScrollbarContainer
