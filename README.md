# Node Microservice Architechture
[![Build Status](https://travis-ci.org/joemccann/dillinger.svg?branch=master)](https://travis-ci.org/joemccann/dillinger).

  - Built with Docker & Haproxy
  - Docker Compose to spin up 4 load balanced instances
  - Supports NGINX Reverse Proxy for container to container communications

# Features!

  - Easily get started with 
```sh
$ docker-compose up
```
  - Ready to deploy mongo atlas and redis connections
  - API samples and routes already in place
  - WEB EJS views and secure routing

### You can also:
  - Move `nginx-reverse-proxy-server` folder out of main project folder and run 
```sh
$ docker-compose up
```
  - Spin up a reverse proxy server that bounces requests to your server

