FROM node:22-bookworm-slim
WORKDIR /app
COPY package.json ./
COPY README.md LICENSE index.html styles.css app.js server.js ./
ENV NODE_ENV=production PORT=8000
EXPOSE 8000
CMD ["node", "server.js"]
