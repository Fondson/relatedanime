FROM node:16-alpine

WORKDIR /app
COPY server/package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY server/ .

CMD [ "yarn", "dev" ]
