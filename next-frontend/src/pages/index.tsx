import Client from 'Client'
import AnimeBackground from 'components/AnimeBackground'
import AnimeSeriesAutoSuggestInput from 'components/AnimeSeriesAutoSuggestInput'
import SeasonalSection from 'components/SeasonalSection'
import { GetStaticProps, NextPage } from 'next'
import { NextSeo } from 'next-seo'
import { SeasonalAnimeItem } from 'types/common'

const description =
  "Discover an anime series' source material, sequels, specials, and more, all on one page!"

type LandingPageProps = {
  animes: SeasonalAnimeItem[]
}

const LandingPage: NextPage<LandingPageProps> = ({ animes }) => {
  return (
    <>
      <NextSeo
        title="Related Anime"
        description={description}
        canonical={process.env.NEXT_PUBLIC_CANONICAL_URL}
        openGraph={{
          url: process.env.NEXT_PUBLIC_CANONICAL_URL,
          title: 'Related Anime',
          description,
          images: [
            {
              url: new URL('/images/sakaeno-general.jpg', process.env.NEXT_PUBLIC_CANONICAL_URL)
                .href,
            },
          ],
        }}
      />

      <div className="h-screen w-screen overflow-hidden">
        <AnimeBackground>
          <div className="flex h-full w-full items-center justify-center overflow-visible bg-black bg-opacity-40">
            <div className="mx-4 min-w-0">
              <h1 className="text-center text-6xl font-bold tracking-wide">Related Anime</h1>
              <h2 className="mx-auto mt-6 mb-4 text-center text-2xl font-medium md:w-1/3">
                {description}
              </h2>
              <div className="mx-auto flex justify-center md:w-1/2">
                <AnimeSeriesAutoSuggestInput />
              </div>
              {animes.length > 0 && (
                <div className="mt-4 md:px-6">
                  <SeasonalSection animes={animes} />
                </div>
              )}
            </div>
          </div>
        </AnimeBackground>
      </div>
    </>
  )
}

const getStaticProps: GetStaticProps<LandingPageProps> = async () => {
  try {
    const { data } = await Client.searchSeasonal()
    return { props: { animes: data } }
  } catch (e) {
    console.log(e)
    return {
      props: { animes: [] },
      revalidate: 60 * 60, // 1 hour
    }
  }
}

export { getStaticProps }
export default LandingPage
