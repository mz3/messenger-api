# optimized multi-stage production build
# install modules using full image
FROM mhart/alpine-node:12
WORKDIR /app
COPY package.json yarn.lock tsconfig.json ./
RUN yarn install --frozen-lockfile

# build container using slim image
FROM mhart/alpine-node:slim-12
WORKDIR /app
COPY --from=0 /app ./
COPY src/ ./src
CMD ["node", "node_modules/.bin/ts-node", "src/index.ts"]
