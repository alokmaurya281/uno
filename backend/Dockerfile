FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN mkdir -p db
EXPOSE 3001
CMD ["node", "server.js"]
