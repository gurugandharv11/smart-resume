# ---------- Build Stage ----------
FROM maven:3.9.9-eclipse-temurin-21 AS builder

WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN mvn clean package -DskipTests

# ---------- Runtime Stage ----------
FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=builder /app/target/*.jar app.jar

ENV PORT=8080

EXPOSE 8080

HEAD
CMD ["sh", "-c", "java -Dserver.port=$PORT -jar app.jar"]
=======
CMD ["sh", "-c", "java -Dserver.port=$PORT -jar app.jar"]
2bb167b44a3ec185440dc3a3313c3d8f69d0b798
