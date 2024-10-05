# Stage 1: Build Stage
FROM node:20.17-alpine3.19 AS build

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install dependencies without dev dependencies
RUN npm ci

# Copy source code
COPY ./src ./src

# Build the app (assumes that "npm run build" compiles to a 'dist' folder)
RUN npm run build

# Stage 2: Production Stage
FROM node:20.17-alpine3.19 AS production

# Set working directory inside the production container
WORKDIR /usr/src/app

# Copy only the build output and necessary files from the build stage
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Set environment to production
ENV NODE_ENV=production

# Expose port 3000
EXPOSE 3000

# Run the application
CMD ["node", "dist/index.js"]
