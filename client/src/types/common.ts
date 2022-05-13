export type MalType = 'anime' | 'manga'

export type MalIdentifier = {
  malType: MalType
  malId: string
}

export type AnimeItem = {
  title: string
  link: string
  image: string
  startDate: string
  type: string
}
