FROM node:20-alpine

WORKDIR /app

# Enable legacy OpenSSL provider for react-scripts if needed (some older versions need it)
ENV NODE_OPTIONS=--openssl-legacy-provider

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

# Start development server
CMD ["npm", "start"]
