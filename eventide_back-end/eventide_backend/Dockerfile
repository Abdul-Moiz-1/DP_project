
# Stage 1: Base image
FROM node:20-alpine AS base

WORKDIR /app
COPY package*.json ./
RUN npm install -g @nestjs/cli
RUN npm install

# Stage 2: Development setup
FROM base AS development

WORKDIR /app
COPY . .
CMD ["npm", "run", "start:dev"]

# Stage 3: Build production artifacts
FROM base AS build

WORKDIR /app
COPY . .
RUN mkdir -p uploads
RUN npm run build

# Stage 4: Production runtime
FROM node:20-alpine AS production

WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm install --omit=dev
RUN mkdir -p uploads
COPY --from=build /app/dist ./dist
COPY --from=build /app/uploads ./uploads
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
