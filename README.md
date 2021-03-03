# Messenger API

A messenger API that allows users to send and receive chat messages

## Limitations

- Clients must use server timezone
- No chat privacy

### Dependencies

- Docker
- Docker-compose
- CUrl

### Getting started

Clone the repository.

```bash
git clone git@github.com:mz3/messenger-api.git
```

Stop any PostgreSQL server running on port 5432. Start the containers with `docker-compose`.

```bash
cd messenger-api
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

Run the tests with `docker`.

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

## Endpoints

- HTTP API (production mode): [http://localhost:3000](http://localhost:3000)
- HTTP API (development mode): [http://localhost:3001](http://localhost:3001)
- Database web UI (pgAdmin): [http://localhost:3002](http://localhost:3002)

To login to the database web UI, enter the credentials.

- Username: `messenger@localhost`
- Password: `messenger`

After logging in, add the messenger database connection parameters.

- Connection type: PostgreSQL
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
docker run -it messenger-api_messenger-api sh
```
