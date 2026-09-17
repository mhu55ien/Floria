FROM node:20-slim

# Set working directory
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
RUN \
  if [ -f package-lock.json ]; then npm ci; \
  elif [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && npm install; \
  fi

# Note: We don't need to copy the entire code here because docker-compose mounts it, 
# but it's good practice to have a complete Dockerfile.
COPY . .

# Expose port for Next.js
EXPOSE 3000

# Start the Next.js development server
CMD ["npm", "run", "dev"]
