FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN apk add --no-cache bash && npm ci && chmod +x /app/docker-entrypoint.sh

COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src

RUN npx prisma generate
RUN npm run build

EXPOSE 4000

CMD ["/app/docker-entrypoint.sh"]
