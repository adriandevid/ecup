FROM node:20-alpine

RUN mkdir -p /usr/app/
WORKDIR /usr/app

COPY . /usr/app

RUN npm i --verbose
RUN npm run build --verbose

#ENV NODE_ENV=development

EXPOSE 3000
CMD ["npm", "run", "start"]
