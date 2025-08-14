FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (keeping vite for production)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Create uploads directory
RUN mkdir -p uploads logs

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]