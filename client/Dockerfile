FROM node:18

WORKDIR /usr/src/app

COPY client/package*.json ./

RUN npm install

COPY client/ ./

RUN npm run build

EXPOSE 4200

CMD ["npx", "ng", "serve", "--host", "0.0.0.0"]
