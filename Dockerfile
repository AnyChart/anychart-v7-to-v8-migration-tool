FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 3001

# -p 3001  override default port (3000)
# -t       trust proxy (preserves original IP through nginx)
CMD ["node", "server.js", "-p", "3001", "-t"]
