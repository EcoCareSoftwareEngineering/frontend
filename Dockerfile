FROM oven/bun:1
WORKDIR /frontend

# Copy only the package files and install dependencies
COPY package.json bun.lockb ./
# RUN rm -rf node_modules
RUN bun install --frozen-lockfile

# Now copy the rest of the files
COPY . .

ARG PORT
EXPOSE 3000
  
CMD ["bun", "run", "dev"]
