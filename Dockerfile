# Use the official Golang image as the build base
FROM golang:latest AS build

# Set the working directory inside the container
WORKDIR /app

# Copy go.mod and go.sum files and download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy the source code into the container
COPY cmd/server /app/cmd/server
COPY internal /app/internal

# Build the application as a static binary
ENV CGO_ENABLED=0 GOOS=linux GOARCH=amd64
RUN go build -a -installsuffix cgo -o main ./cmd/server

# Use scratch as the final base image
FROM scratch

# Set working directory and copy the built binary
WORKDIR /app
COPY --from=build /app/main /app/main

# Copy required files (including db-schema.sql)
COPY internal/config/config.json /app/internal/config/config.json
COPY internal/database/forumDB.db /app/internal/database/forumDB.db
COPY internal/database/db-schema.sql /app/internal/database/db-schema.sql

# Expose the application's port
EXPOSE 8080

# Set the entrypoint to the application
ENTRYPOINT ["/app/main"]
