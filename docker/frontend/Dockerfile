FROM node:20-alpine AS base

WORKDIR /app

COPY frontend/package*.json ./
RUN npm ci

COPY frontend ./

RUN npm run build

EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

CMD ["npm", "start"]
