FROM node:24-bookworm-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY backend ./backend
ENV NODE_ENV=production
USER node
CMD ["sh", "-c", "npm run db:migrate && npm start"]
