# syntax=docker/dockerfile:1.7
#
# One Dockerfile for every deployable. Pick it with --build-arg APP=<name>:
#   shell | marketing | auth | dashboard | landing -> static files behind unprivileged nginx
#   api                                   -> the GraphQL server on Node
# Each image is built and deployed independently; that is the point of microfrontends.

ARG NODE_VERSION=22
ARG NGINX_VERSION=1.27
# Declared before the first FROM so the final `FROM runtime-${APP}` can use it.
ARG APP

# ---- build: install once, build only the app and what it depends on -----------------------
FROM node:${NODE_VERSION}-alpine AS build
RUN corepack enable
WORKDIR /repo
COPY . .
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile
RUN pnpm codegen
ARG APP
RUN pnpm --filter "@blog/${APP}..." build

# ---- runtime: static apps -----------------------------------------------------------------
FROM nginxinc/nginx-unprivileged:${NGINX_VERSION}-alpine AS runtime-static
ARG APP
COPY infra/nginx/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY infra/nginx/app.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/apps/${APP}/dist /usr/share/nginx/html
# Source maps stay out of the image; upload them to the error tracker in CI instead.
USER root
RUN find /usr/share/nginx/html -name '*.map' -delete
USER nginx
EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=3s --retries=5 CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1

# ---- runtime: api -------------------------------------------------------------------------
FROM node:${NODE_VERSION}-alpine AS runtime-api
ENV NODE_ENV=production PORT=4000
WORKDIR /app
COPY --from=build /repo/apps/api/dist/server.cjs ./server.cjs
USER node
EXPOSE 4000
HEALTHCHECK --interval=10s --timeout=3s --retries=5 CMD wget -qO- http://127.0.0.1:4000/healthz || exit 1
CMD ["node", "server.cjs"]

# ---- select the runtime from APP ----------------------------------------------------------
FROM runtime-static AS runtime-shell
FROM runtime-static AS runtime-marketing
FROM runtime-static AS runtime-auth
FROM runtime-static AS runtime-dashboard
FROM runtime-static AS runtime-landing

FROM runtime-${APP} AS final
