FROM node:14-alpine AS development
ENV NODE_ENV development

WORKDIR /app/frontend

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install the required dependencies
RUN npm install --force

COPY . .

EXPOSE 3000
# RUN npm ci
# for development
CMD ["npm", "start"] 

# for deployment
# CMD ["npm", "run", "build"] 