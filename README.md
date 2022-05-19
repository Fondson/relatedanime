# Related Anime

<img src="https://shot.screenshotapi.net/screenshot?&url=https%3A%2F%2Frelatedanime.com%2F&output=image&file_type=png&wait_for_event=load/">

[Visit relatedanime.com!](http://relatedanime.com/)

## Description

Related Anime is a website used to discover all the different media related to an anime series.
The creation of Related Anime was motivated by the fact that the popular anime reference site [MyAnimeList](https://myanimelist.net/) (MAL) has information on all the related media of an anime series, but no easy way to see it visually.

## Features

- Gets all anime-related information purely by web scraping (this website does not rely on any anime APIs)
- Lists currently airing seasonal animes
- Autosuggestions in search bar based on MAL suggestions
- Heavily utilizes caching using [Redis](https://redis.io/) and [DynamoDB](https://aws.amazon.com/dynamodb/)
- Implements an Express API server that scrapes information from MAL
  - Scraping updates are sent by the server using HTML5 server-sent events
  - Uses [Cheerio](https://github.com/cheeriojs/cheerio) to parse MAL pages
- Frontend is done using [Next.js](https://nextjs.org/)
- Progressive Web App (PWA) functionality using [next-pwa](https://github.com/shadowwalker/next-pwa)

## Examples

### Steins;Gate

https://relatedanime.com/anime/9253
<img src="https://screenshotapi-dot-net.storage.googleapis.com/relatedanime_com_anime_92_068c89df1254.png">

### Pokemon

https://relatedanime.com/anime/527
<img src="https://shot.screenshotapi.net/screenshot?&url=https%3A%2F%2Frelatedanime.com%2Fanime%2F527&output=image&file_type=png&wait_for_event=load">

Screenshot generated for **FREE** by [Screenshot API](https://www.screenshotapi.net/) - they're awesome!

## Development

This is a monorepo codebase. The server (backend) code is under the `server` directory and the frontend code is under the `next-frontend` directory.

### Setup

```bash
yarn setup
```

### Run the app locally

```bash
# This runs the nextjs server on :3000 and the express server on :3001 by default
yarn dev
```
