FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application files
COPY server.js ./
COPY public/ ./public/

# Expose server port
EXPOSE 3000

# Environment variables
ENV PORT=3000
ENV NODE_ENV=production

# Run command
CMD ["node", "server.js"]
