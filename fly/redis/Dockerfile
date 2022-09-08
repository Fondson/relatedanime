FROM golang:alpine AS go-build
RUN go install github.com/DarthSim/overmind/v2@latest && \
    cp $GOPATH/bin/overmind /usr/local/bin/

FROM redis:alpine
RUN apk update && \
    apk add --no-cache tmux 
COPY --from=go-build /usr/local/bin/overmind /usr/local/bin/overmind

COPY fly/redis/config/page-data-redis.conf /usr/local/etc/redis/page-data-redis.conf
COPY fly/redis/config/mal-cache-redis.conf /usr/local/etc/redis/mal-cache-redis.conf
COPY fly/redis/config/search-and-seasonal-redis.conf /usr/local/etc/redis/search-and-seasonal-redis.conf

WORKDIR /app
COPY fly/redis/Procfile ./Procfile
COPY fly/redis/start.sh ./start.sh
CMD ["./start.sh"]
