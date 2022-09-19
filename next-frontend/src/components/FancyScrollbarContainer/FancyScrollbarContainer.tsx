import styles from 'components/FancyScrollbarContainer/FancyScrollbarContainer.module.scss'
import { useEffect, useRef } from 'react'

type FancyScrollbarContainerProps = Partial<React.HTMLAttributes<HTMLDivElement>> & {
  children: React.ReactNode
  passRef?: React.MutableRefObject<HTMLDivElement | undefined>
  hide?: boolean
}

const FancyScrollbarContainer = ({
  children,
  className = '',
  passRef = undefined,
  hide = true,
  ...rest
}: FancyScrollbarContainerProps) => {
  const ref = useRef<HTMLDivElement>()
  useEffect(() => {
    if (passRef == null) return
    ref.current = passRef.current
  }, [passRef])

  return (
    <div
      ref={(passRef ?? ref) as React.RefObject<HTMLDivElement>}
      className={`${styles['fancy-scrollbar-container']} ${
        hide
          ? styles['fancy-scrollbar-container-without-width']
          : styles['fancy-scrollbar-container-always-show']
      } ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}

export default FancyScrollbarContainer
