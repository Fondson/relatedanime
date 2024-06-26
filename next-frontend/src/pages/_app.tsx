import '@mantine/core/styles.css'
import 'styles/globals.css'
import 'styles/scrollbar.scss'

import { createTheme, MantineProvider } from '@mantine/core'
import GoogleAnaytics from 'components/GoogleAnalytics'
import PwaTags from 'components/PwaTags'
import useAckeeDomain from 'hooks/useAckeeDomain'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { DefaultSeo } from 'next-seo'

const theme = createTheme({
  primaryColor: 'gray',
})

function App({ Component, pageProps }: AppProps) {
  useAckeeDomain()

  return (
    <>
      <Head>
        <PwaTags />
      </Head>

      {/* These only work if they're OUTSIDE the Head component */}
      <DefaultSeo
        openGraph={{
          type: 'website',
          site_name: 'Related Anime',
        }}
      />
      <GoogleAnaytics />

      <MantineProvider theme={theme} forceColorScheme="dark">
        <Component {...pageProps} />
      </MantineProvider>
    </>
  )
}

export default App
