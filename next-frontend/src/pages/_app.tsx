import 'styles/globals.css'

import GoogleAnaytics from 'components/GoogleAnalytics'
import PwaTags from 'components/PwaTags'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { DefaultSeo } from 'next-seo'

function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <DefaultSeo
          openGraph={{
            type: 'website',
            site_name: 'Related Anime',
          }}
        />
        <PwaTags />
        <GoogleAnaytics />
        <base target="_blank" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}

export default App
