# ========== Estágio 1: build do frontend ==========
FROM node:20-alpine AS frontend
WORKDIR /front
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# ========== Estágio 2: build do backend ==========

FROM maven:3.9-eclipse-temurin-21 AS backend
WORKDIR /back
COPY backend/doabem/pom.xml .
RUN mvn -q dependency:go-offline
COPY backend/doabem/src ./src
COPY --from=frontend /front/dist ./src/main/resources/static
RUN mvn -q package -DskipTests

# ========== Estágio 3: imagem final ==========
FROM postgres:16-trixie

RUN apt-get update \
 && apt-get install -y --no-install-recommends openjdk-21-jre-headless supervisor \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=backend /back/target/*.jar /app/app.jar
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

EXPOSE 8080

ENTRYPOINT []
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]