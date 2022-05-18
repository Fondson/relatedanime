import styles from 'components/FancyScrollbarContainer/FancyScrollbarContainer.module.css'
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
  onScroll = () => {
    return
  },
  ...rest
}: FancyScrollbarContainerProps) => {
  const ref = useRef<HTMLDivElement>() as React.MutableRefObject<HTMLDivElement>
  useEffect(() => {
    if (passRef == null) return
    ref.current = passRef.current
  }, [passRef])
  const debouncedHideScrollbar = useMemo(
    () => debounce(() => ref.current.classList.remove(styles['show-scrollbar']), 500),
    [ref],
  )

  return (
    <div
      ref={passRef ?? ref}
      className={`${styles['fancy-scrollbar-container']} ${className}`}
      onScroll={(e) => {
        onScroll(e)

        // inspired by https://stackoverflow.com/a/68416028
        ref.current.classList.add(styles['show-scrollbar'])
        debouncedHideScrollbar()
      }}
      {...rest}
    >
      {children}
    </div>
  )
}

export default FancyScrollbarContainer
