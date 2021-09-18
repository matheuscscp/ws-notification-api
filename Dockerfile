FROM node:14.16-alpine

WORKDIR /app

ADD package.json package.json
ADD package-lock.json package-lock.json

RUN npm i

ADD src src

ENTRYPOINT ["node", "src/index.js"]
