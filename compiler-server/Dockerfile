# backend/Dockerfile
FROM node:20-alpine

# Set working directory
WORKDIR /app

RUN apk add --no-cache g++ 
# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Expose the port your app runs on
EXPOSE 8000

# Start the app
CMD ["npm", "start"]
