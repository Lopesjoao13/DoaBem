FROM node:22-alpine AS build
WORKDIR /front
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
ENV NGINX_ENTRYPOINT_LOCAL_RESOLVERS=1
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /front/dist /usr/share/nginx/html
EXPOSE 80
