FROM node:20

WORKDIR /user/src/app

# Installing pm2 in global
RUN npm install -g pm2


COPY package*.json ./
COPY ecosystem.config.js ./

# Install dependencies
RUN npm install

COPY . .

EXPOSE 5000

# CMD ["node", "server.js"]
CMD ["pm2-runtime", "ecosystem.config.js"]

