import Script from 'next/script'

const ACKEE_URL = process.env.NEXT_PUBLIC_ACKEE_URL
const ACKEE_DOMAIN_ID = process.env.NEXT_PUBLIC_ACKEE_DOMAIN_ID

const AckeeAnaytics = () => {
  return (
    <>
      <Script
        id="ackee"
        strategy="afterInteractive"
        src={ACKEE_URL ? new URL('/tracker.js', ACKEE_URL).href : ''}
        data-ackee-server={ACKEE_URL}
        data-ackee-domain-id={ACKEE_DOMAIN_ID}
      />
    </>
  )
}

export default AckeeAnaytics
