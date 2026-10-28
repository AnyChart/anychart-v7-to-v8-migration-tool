FROM node:22.23.4-alpine@sha256:fe4f6d74e20370acb04ad889077d14d0f64a9c8ea6a42bc60cddf1e844699914

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 3001

# -p 3001  override default port (3000)
# -t       trust proxy (preserves original IP through nginx)
CMD ["node", "server.js", "-p", "3001", "-t"]
