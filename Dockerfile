FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install --omit=dev

COPY . .

RUN npm install dotenv

EXPOSE 5000

CMD [ "node","app.js" ]
