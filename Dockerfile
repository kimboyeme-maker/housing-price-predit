# syntax=docker/dockerfile:1

########## Stage 1: build with aube (reproducible, frozen lockfile) ##########
FROM node:24.16.0-slim AS build

RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install mise, then the aube package manager through it (aqua:jdx/aube).
RUN curl -fsSL https://mise.run | sh
ENV PATH="/root/.local/bin:/root/.local/share/mise/shims:${PATH}"
RUN mise use -g aube@latest

WORKDIR /app
# Include the project aube config (advisoryCheck override) so install matches local.
COPY package.json aube-lock.yaml ./
COPY .config ./.config
RUN mise exec aube@latest -- aube install --frozen-lockfile

COPY . .
# API base is baked at build time (Vite). Default to same-origin /api (nginx proxy).
ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}
RUN mise exec aube@latest -- aube run build

########## Stage 2: nginx static server ##########
FROM nginx:alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
