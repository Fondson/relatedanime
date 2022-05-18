import 'styles/globals.css'

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

      <base target="_blank" />
      <Component {...pageProps} />
    </>
  )
}

export default App
