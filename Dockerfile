FROM oven/bun:1
WORKDIR /frontend

# Copy the lock and package file
COPY . .
RUN rm -rf node_modules

# Install dependencies
RUN bun install --frozen-lockfile


ARG PORT
EXPOSE 3000
     
CMD ["bun", "run", "dev"]