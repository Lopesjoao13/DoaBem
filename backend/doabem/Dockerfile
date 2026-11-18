FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build
COPY pom.xml .
RUN mvn -q -B dependency:go-offline
COPY src ./src
RUN mvn -q -B package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S doabem && adduser -S doabem -G doabem
COPY --from=build /build/target/*.jar /app/app.jar
USER doabem
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
