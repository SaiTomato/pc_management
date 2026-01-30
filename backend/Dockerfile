FROM node:20-alpine

WORKDIR /app

# Install dependencies needed for some node packages
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm install

COPY . .

# Build the project
RUN npm run build

EXPOSE 3001

# Start in dev mode for now to support auto-reload if volumes are used
CMD ["npm", "run", "dev"]
