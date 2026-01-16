# Use Debian-based image to avoid Alpine DNS/Network timeouts
FROM node:18-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy app source
COPY . .

# Expose port
EXPOSE 5000

# Start command
CMD ["npm", "start"]
