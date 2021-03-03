# Messenger API

A messenger API that allows users to send and receive chat messages

## Limitations

- Clients must use server timezone
- No chat privacy

## Running with Docker

### Dependencies

- Docker
- Docker-compose
- CUrl

### Getting started

Start the containers with `docker-compose`.

```bash
docker-compose up
```

Send some test commands with `curl`.

```bash
# Send a message to chat 1 from user 2
curl -H "Content-Type: application/json" \
  -X POST \
  -d '{
    "body": "Hello, chat!",
    "chat": 1,
    "user": 2
  }' \
  http://localhost:3000/send-message

# Get all messages
curl -H "Content-Type: application/json" \
  -X POST \
  http://localhost:3000/get-messages

# Get messages in chat 1
curl -H "Content-Type: application/json" \
  -X POST \
  -d '{
    "chat": 1
  }' \
  http://localhost:3000/get-messages

# Get messages sent by user 1
curl -H "Content-Type: application/json" \
  -X POST \
  -d '{
    "chat": 1
  }' \
  http://localhost:3000/get-messages
```

Run the tests with `docker`

```bash
docker exec -it messenger-api_api_1 node node_modules/.bin/ts-node src/test.ts
```

## Development

VS Code is recommended for Typescript Intellisense.

- Docker image
- Integration tests
- Typescript

### Additional dependencies

- Node.js
- Yarn
- Web browser

## HTTP endpoints

- [API (production mode)](http://localhost:3000)
- [API (development mode)](http://localhost:3001)
- [pgAdmin](http://localhost:3002) (Username = `messenger@localhost`, Password = `messenger`)

After logging into pgAdmin, add the messenger database connection parameters:

- Connection type: `postgres`
- Database name: `messenger`
- Username: `messenger`
- Password: `messenger`

### Yarn scripts

```json
{
  "start": "yarn docker:build && yarn docker:start",
  "test": "yarn docker:test",
  "docker:build": "docker-compose build",
  "docker:start": "docker-compose up --build -d",
  "docker:stop": "docker-compose down",
  "docker:test": "docker exec -it messenger-api_api_1 node node_modules/.bin/ts-node src/test.ts",
  "node:start": "cross-env PORT=3001 ts-node src/index.ts",
  "node:watch": "cross-env PORT=3001 ts-node-dev src/index.ts",
  "node:test": "cross-env HTTP_ENDPOINT=http://localhost:3001 ts-node-dev src/test.ts"
}
```

## Notes

Debug Docker image:

```bash
yarn build:docker
docker run -it messenger-api_messenger-api sh # different if you cloned to a dir other than "messenger-api"
```
