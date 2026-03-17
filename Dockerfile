FROM node:20-alpine

# Use production level node environment
ENV NODE_ENV production

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Bundle app source
COPY . .

# Expose typical WebSocket port
EXPOSE 3000

# Expose standard P2P port
EXPOSE 5000

# Start the node daemon
CMD [ "npm", "start" ]
