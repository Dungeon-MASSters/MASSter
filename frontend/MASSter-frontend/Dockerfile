FROM node:18

COPY .env.production .
COPY package.json .
COPY package-lock.json .

RUN npm install

COPY . .

RUN npm run build

