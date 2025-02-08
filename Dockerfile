FROM oven/bun:1
WORKDIR /frontend

# Copy only the package json and lockfile
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Now copy the rest of the files
COPY . .

ARG PORT
EXPOSE 3000
  
CMD ["bun", "run", "dev"]
