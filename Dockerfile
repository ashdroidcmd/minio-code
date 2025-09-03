FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json yarn.lock ./
RUN yarn

# Copy all source
COPY . .

# Build the NestJS project
RUN yarn build

# Expose port
EXPOSE 3002

# Start the app
CMD ["yarn", "start:prod"]
