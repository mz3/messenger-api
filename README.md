# Messenger API

A messenger API that allows users to send and receive chat messages

## Development features

* Docker image
* Integration tests
* Typescript

## Running with Docker

### Dependencies

- Docker
- Docker-compose
- CUrl

### Getting started

```bash
# Start the API
docker-compose up

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

## Local development

### Additional dependencies

* Node.js/NPM
* Yarn
* Web browser

### Database admin

pgAdmin runs on port 3002 (http://localhost:3002). Log in using the credentials:

* Username: `messenger@localhost`
* Password: `messenger`

Add the messenger database connection:

* Connection type: `postgres`
* Database name: `messenger`
* Username: `messenger`
* Password: `messenger`


### Yarn scripts

```bash
# Build Docker container
yarn build

# Start Docker containers
# API:     http://localhost:3000
# PGAdmin: http://localhost:5433
yarn start:docker

# Start API with Node.js
# API:     http://localhost:3001
yarn start:node

# Start API with Node.js in watch mode
# API:     http://localhost:3001
yarn start:node-dev

# Run tests in Docker container
yarn test:docker

# Run tests with Node.js
yarn test:node

# Run tests in Docker container
yarn test
```

## Limitations

- Clients must use server timezone
- No chat privacy

## Notes

Debug Docker image:

```bash
yarn build:docker
docker run -it messenger-api_messenger-api sh # different if you cloned to a dir other than "messenger-api"
```
