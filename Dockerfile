# ---- build: compila o Java e o frontend do Vaadin (Node e baixado automaticamente pelo plugin) ----
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY frontend frontend
COPY src src
RUN mvn -B -q -Pproduction -DskipTests package

# ---- runtime ----
FROM eclipse-temurin:17-jre
WORKDIR /app
RUN useradd --system --create-home studyplanner
COPY --from=build /app/target/study-planner-*.jar app.jar
USER studyplanner
ENV SPRING_PROFILES_ACTIVE=prod \
    JAVA_OPTS="-XX:MaxRAMPercentage=75"
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]
