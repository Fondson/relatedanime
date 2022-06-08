export type MalType = 'anime' | 'manga'

export type MalIdentifier = {
  malType: MalType
  malId: string | number
}

export type AnimeItem = {
  malType: MalType
  malId: string | number
  title: string
  link: string
  image: string
  startDate: string
  type: string
  maybeRelated: boolean
}

export type SeasonalAnimeItem = {
  malType: MalType
  id: string | number
  img: string
  title: string
}

export type AnimeItemsByType = {
  [key: string]: AnimeItem[]
}
