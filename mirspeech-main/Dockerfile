FROM node:18.15.0-slim

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

RUN npm i

COPY client/package.json ./client/
COPY client/package-lock.json ./client/

RUN npm i --prefix client

COPY ./ ./

RUN VITE_SERVER_URL="https:/mirspeech.ergov.com" npm run build --prefix client

EXPOSE 3000

CMD ["npm", "run", "start"]