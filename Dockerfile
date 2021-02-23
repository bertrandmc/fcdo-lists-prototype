# ----------------------------
# Stage 1
# Base image contains the updated OS and
# It also configures the non-root user that will be given permission to copied files/folders in every subsequent stages
FROM node:12-alpine3.12 AS base
RUN mkdir -p /usr/src/app && \
    addgroup -g 1001 appuser && \
    adduser -S -u 1001 -G appuser appuser && \
    chown -R appuser:appuser /usr/src/app && \
    chmod -R +x  /usr/src/app && \
    apk update && \
    apk upgrade && \
    apk add --no-cache bash git python2 make g++

# ----------------------------
# Stage 2
# Cache layer contains npm packages
# It will re-run only if package.json changes, otherwise this stage is cached
FROM base AS dependencies
WORKDIR /usr/src/app
COPY --chown=appuser:appuser package.json ./
RUN npm install -g http-server
USER 1001
RUN npm install

# ----------------------------
# Stage 3
# Static files
# Copy files and folders that won't change frequently to allow caching
FROM dependencies AS static
WORKDIR /usr/src/app
COPY --chown=appuser:appuser ./docs ./docs/
COPY --chown=appuser:appuser ./gulp ./gulp/
COPY --chown=appuser:appuser ./lib ./lib/
COPY --chown=appuser:appuser ./public ./public/
COPY gulpfile.js listen-on-port.js Procfile server.js start.js usage-data-config.json ./

# ----------------------------
# Stage 4
# App stage
# Copy app folder
FROM static AS app
WORKDIR /usr/src/app
COPY --chown=appuser:appuser ./app ./app/
USER 1001
EXPOSE 3000
RUN ls -al
CMD [ "npm", "start" ]
