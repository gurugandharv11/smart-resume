# Stage 1: Build the application
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app

# Copy the Maven wrapper files and pom.xml first to leverage Docker layer caching
COPY .mvn/ .mvn
COPY mvnw pom.xml ./

# Ensure the Maven wrapper is executable
RUN chmod +x mvnw

# Download dependencies (this layer will be cached unless pom.xml changes)
RUN ./mvnw dependency:go-offline

# Copy the rest of the application source code
COPY src ./src

# Package the application, skipping tests to speed up the build
RUN ./mvnw clean package -DskipTests

# Stage 2: Create the optimized runtime image
FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app

# Run as a non-root user for improved security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser:appgroup

# Copy only the built JAR file from the builder stage
# Assuming the generated JAR ends with .jar in the target directory
COPY --from=builder /app/target/*.jar app.jar

# Use the PORT environment variable (used by Render), defaulting to 8080
ENV PORT=8080

# Expose the port
EXPOSE ${PORT}

# Start the application, passing the PORT environment variable
CMD ["sh", "-c", "java -Dserver.port=${PORT} -jar app.jar"]
