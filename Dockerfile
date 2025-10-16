# Stage 1: Build
FROM node:18 AS build

# Set working directory
WORKDIR /app

# Copy dependencies first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire project
COPY . .

# Compile TypeScript files
RUN npm run build

# Stage 2: Production
FROM node:18-slim

# Set working directory
WORKDIR /app

# Copy only the necessary files from the build stage
COPY --from=build /app/package*.json ./
COPY --from=build /app/dist ./dist

# Install production dependencies
RUN npm install --only=production

# Expose port and start the app
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
