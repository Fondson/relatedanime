import { AckeeInstance, DefaultData, DetailedData, TrackingOptions } from 'ackee-tracker'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

declare interface AckeeTracker {
  create(server: string, options?: TrackingOptions): AckeeInstance
  attributes(detailed?: false): DefaultData
  attributes(detailed: true): DefaultData & DetailedData
  attributes(detailed?: boolean): DefaultData | (DefaultData & DetailedData)
  detect(): void
}

interface AckeeWindow extends Window {
  ackeeTracker?: AckeeTracker
}

const ACKEE_URL = process.env.NEXT_PUBLIC_ACKEE_URL
const ACKEE_DOMAIN_ID = process.env.NEXT_PUBLIC_ACKEE_DOMAIN_ID

async function initializeAckee(): Promise<void> {
  return new Promise((resolve) => {
    ;((d: Document, id: string, onload: () => void) => {
      const element = d.getElementsByTagName('script')[0]
      const fjs = element
      let js = element
      js = d.createElement('script')
      js.id = id
      js.src = ACKEE_URL ? new URL('/tracker.js', ACKEE_URL).href : ''
      if (fjs.parentNode) {
        fjs.parentNode.insertBefore(js, fjs)
        js.onload = onload
      } else {
        console.error('No script tag found')
      }
    })(document, 'ackee', () => {
      resolve()
    })
  })
}

const useAckeeDomain = () => {
  const router = useRouter()

  const handleRouteChange = () => {
    const ackeeWindow: AckeeWindow = window
    if (ACKEE_URL && ACKEE_DOMAIN_ID && ackeeWindow?.ackeeTracker) {
      const ackeeTracker = ackeeWindow.ackeeTracker
      ackeeTracker.create(ACKEE_URL, { detailed: true }).record(ACKEE_DOMAIN_ID)
    }
  }

  useEffect(() => {
    initializeAckee().then(() => {
      handleRouteChange()
    })
  }, [])

  useEffect(() => {
    router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events])
}

export default useAckeeDomain
