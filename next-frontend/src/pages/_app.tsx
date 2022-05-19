import 'styles/globals.css'

import GoogleAnaytics from 'components/GoogleAnalytics'
import type { AppProps } from 'next/app'
import { DefaultSeo } from 'next-seo'

function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <DefaultSeo
        openGraph={{
          type: 'website',
          site_name: 'Related Anime',
        }}
      />

      <GoogleAnaytics />
      <base target="_blank" />
      <Component {...pageProps} />
    </>
  )
}

export default App
