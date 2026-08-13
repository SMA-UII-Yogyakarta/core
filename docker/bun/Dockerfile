FROM oven/bun:1-alpine

# Install additional necessary tools if needed (e.g., git, bash)
RUN apk add --no-cache bash git

# Set working directory
WORKDIR /var/www/html

# Command to keep the container running indefinitely
# so we can use `docker compose exec bun ...`
CMD ["tail", "-f", "/dev/null"]
