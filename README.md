# Related Anime

<a href="http://relatedanime.com/">Visit the website!</a>

# Description
Related Anime is a website used to discover all the different media related to an anime series.
The creation of Related Anime was motivated by the fact that the popular anime reference site <a href='https://myanimelist.net/'>MyAnimeList</a> has information on all the related media of an anime series, but no easy way to see it visually.

# Features
- gets all anime-related information purely by web scraping (that is, this website does not rely on any anime APIs)
- caches recent seraches using [Redis](https://redis.io/)
- uses a <a href="https://neo4j.com/">Neo4j</a> graph database to store selected longer series for quicker lookup
  - try searching for the <i>Attack on Titan</i> or <i>Fate</i> anime series for near instant lookup
- implements an Express API server that scraps information from <a href="https://myanimelist.net/">MyAnimeList</a>
  - scraping updates are sent by the server using HTML5 server-sent events
- front-end is done using React (created by [create-react-app](https://github.com/facebookincubator/create-react-app))
- uses <a href="https://github.com/cheeriojs/cheerio">Cheerio</a> to parse markup data from <a href="https://myanimelist.net/">MyAnimeList</a> HTTP response
