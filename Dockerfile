FROM node:22.23.5-alpine@sha256:1314fb30ec37592d5845e5a160d522c0e680972aa534549940b8d73bde88481a

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 3001

# -p 3001  override default port (3000)
# -t       trust proxy (preserves original IP through nginx)
CMD ["node", "server.js", "-p", "3001", "-t"]
