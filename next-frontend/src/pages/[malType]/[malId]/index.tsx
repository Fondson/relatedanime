import Client from 'Client'
import AnimeSeriesAutoSuggestInput from 'components/AnimeSeriesAutoSuggestInput'
import HomeButton from 'components/HomeButton'
import LoadingPage from 'components/LoadingPage'
import SectionsContainer from 'components/SectionsContainer'
import useCheckMobile from 'hooks/useCheckMobile'
import { isEmpty } from 'lodash'
import { GetStaticPaths, GetStaticProps, NextPage } from 'next'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import { useEffect, useState } from 'react'
import { AnimeItemsByType, MalType } from 'types/common'

const defaultLoadingString = 'Scraping MAL...'

type ResourcePageProps = {
  title: string
  image: string
}

const ResourcePage: NextPage<ResourcePageProps> = ({ title, image }) => {
  const isMobile = useCheckMobile()
  const router = useRouter()

  const { malType, malId } = router.query as { malType: MalType; malId: string }

  const [isLoading, setIsLoading] = useState(true)
  const [needsScraping, setNeedsScraping] = useState(false)
  const [loadingString, setLoadingString] = useState(defaultLoadingString)
  const [animes, setAnimes] = useState<AnimeItemsByType>({})
  const [error, setError] = useState(false)

  useEffect(() => {
    if (malId == null) {
      return
    }

    if (error) {
      router.replace('/error')
      return
    }

    setIsLoading(true)
    Client.crawl(
      malType,
      malId,
      (e) => {
        if (!needsScraping) {
          setNeedsScraping(true)
        }
        setLoadingString((prev) => [`Found ${e.data}`, prev].join('\n'))
      },
      (e) => {
        setLoadingString(defaultLoadingString)
        const data = e.data ? JSON.parse(e.data) : null
        if (data && !isEmpty(data)) {
          setAnimes(data)
          setIsLoading(false)
          setNeedsScraping(false)
        } else {
          setError(true)
        }
      },
      () => setError(true),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [malType, malId, error])

  const seoData = {
    title,
    description: `Discover everything related to ${title} on Related Anime!`,
    url: new URL(`${malType}/${malId}`, process.env.NEXT_PUBLIC_CANONICAL_URL).href,
    image,
  }
  return (
    <>
      <NextSeo
        title={seoData.title}
        description={seoData.description}
        canonical={seoData.url}
        openGraph={{
          url: seoData.url,
          title: seoData.title,
          description: seoData.description,
          images: [
            {
              url: seoData.image,
            },
          ],
        }}
      />

      {needsScraping ? (
        <LoadingPage loadingString={loadingString} />
      ) : isLoading ? null : (
        <div className={`${isMobile ? '' : 'h-screen'} overflow-y-auto`}>
          <div className="mx-auto max-w-6xl px-6 py-7 lg:py-14">
            <div className="mb-2 flex items-start">
              <HomeButton />
              <div className="flex-grow">
                <AnimeSeriesAutoSuggestInput />
              </div>
            </div>
            <SectionsContainer animes={animes} />
          </div>
        </div>
      )}
    </>
  )
}

const getStaticProps: GetStaticProps<ResourcePageProps> = async ({ params }) => {
  const { malType, malId } = params as { malType: MalType; malId: string }
  try {
    const { data } = await Client.getResourcePageSeoData(malType, malId)
    return {
      props: { ...data },
      revalidate: 60 * 60, // 1 hour
    }
  } catch (e) {
    console.error(e)
    return {
      redirect: {
        destination: '/error',
        permanent: false,
      },
    }
  }
}

const getStaticPaths: GetStaticPaths = async () => {
  return { paths: [], fallback: 'blocking' }
}

export { getStaticPaths, getStaticProps }
export default ResourcePage
