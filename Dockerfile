# Base image
FROM oven/bun:latest

# Set working directory
WORKDIR /app

# Copy package files first to leverage Docker caching
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy the rest of the app
COPY . .

# Expose port (Hono typically uses 3000)
EXPOSE 3000

# Start the application
CMD ["bun", "run", "start"]
