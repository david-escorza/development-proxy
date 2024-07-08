# Proxy application for OpenId login in the DG1 development environment

This application serves as a proxy server for development purposes,
forwarding HTTP requests to an internal development API endpoint (`http://api.dg1.test`).

## Features

- Forwards GET and POST requests to http://api.dg1.test.
- Handles JSON and URL-encoded bodies.
-  Logs request details (path, headers, query, body).

## Prerequisites

- Node.js
- Npm
- Ngrok ([Download ngrok](https://ngrok.com/download))
- An Ngrok endpoint/domain
- An Ngrok edge assigned to a domain

### Ngrok setup
In your ngrok dashboard set up an edge and associate it with a domain.
Every free account has one free domain already assigned.

## Install
```bash
npm install
```

## Set up the ngrok tunnel
Edit the start_tunnel.sh and start-all.sh scripts and assign your ngrok edge
to the NGROK_EDGE variable:

```bash
NGROK_EDGE="edghts_2hgx1TzXxwRBfIn020w1NZzOUxV"
```
## Usage
Everything can be started by running:
```bash
./start-all.sh
```

This starts the ngrok tunnel on port 3000, afer five seconds it also starts the
proxy application which listen all requests on port 3000.

Type Ctrl-C for stopping the proxy application and stopping the ngrok tunnel.

## Usage (old way)

- Start the ngrok tunnel and assign port 3000 to it:
```bash
./start_tunnel.sh 3000
```
- Start the proxy application (it runs by default on port 3000):
```bash
npm start
```
If you are running the tunnel on another port than 3000, specify it when starting the proxy application:
```bash
npm start 8080
```

For stopping the proxy just type Ctrl-C. Then stop the Ngrok tunnel:
```bash
./stop-ngrok.sh
```
