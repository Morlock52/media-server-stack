FROM node:20-alpine AS build
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --production
COPY --from=build /app/dist ./dist
COPY --from=build /app/server.js ./
ENV PORT=3000
CMD ["node", "server.js"]
