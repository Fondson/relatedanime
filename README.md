# Related Anime
<img src="https://aprc.it/api/1200x630/http://relatedanime.com/">

[Visit relatedanime.com!](http://www.relatedanime.com/)

# Description
Related Anime is a website used to discover all the different media related to an anime series.
The creation of Related Anime was motivated by the fact that the popular anime reference site [MyAnimeList](https://myanimelist.net/) (MAL) has information on all the related media of an anime series, but no easy way to see it visually.

# Features
- gets all anime-related information purely by web scraping (this website does not rely on any anime APIs)
- lists currently airing seasonal animes
- autosuggestions in search bar based on MAL suggestions
- heavily utilizes caching using [Redis](https://redis.io/)
  - most of cache is automatically refresh periodically through crons using a [proxy](https://github.com/Fondson/relatedanime-proxy)
- implements an Express API server that scraps information from MAL
  - scraping updates are sent by the server using HTML5 server-sent events
- front-end is done using React (created by [create-react-app](https://github.com/facebookincubator/create-react-app))
- uses [Cheerio](https://github.com/cheeriojs/cheerio) to parse markup data from MAL HTTP response

# Examples
## Steins;Gate
http://www.relatedanime.com/anime/9253
<img src="https://aprc.it/api/1200x630/http://www.relatedanime.com/anime/9253"> 
## Pokemon
http://www.relatedanime.com/anime/527
<img src="https://aprc.it/api/1200x630/http://www.relatedanime.com/anime/527"> 

Screenshot generated for **FREE** by [Apercite](https://apercite.fr/en/) - they're awesome!

# Feature Roadmap
- find some way to keep autosuggestions up-to-date automatically without bombarding MAL servers
  - there are too many search queries for autosuggest so can't just refresh
