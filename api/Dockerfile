FROM node:14.2.0-slim
MAINTAINER Arturo Volpe <arturovolpe@gmail.com>

COPY ./dist/ /app/dist
COPY ./node_modules/ /app/node_modules

WORKDIR /app

CMD ["node", "/app/dist/index.js"]

