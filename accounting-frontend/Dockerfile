FROM node:22-alpine
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

RUN npm run build

# Expose port (matches FRONTEND_PORT in .env)
EXPOSE 8000

# Run development server
CMD ["npm", "run", "dev"]