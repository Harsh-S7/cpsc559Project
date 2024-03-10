FROM node:latest

RUN npm i -g pnpm
# Set the working directory in the container

WORKDIR /app/client

# Copy the package.json and package-lock.json files to the container
COPY package.json pnpm-lock.yaml vite.config.js ./

# Install dependencies
RUN pnpm install

# Copy the rest of the application code to the container
COPY . .

EXPOSE 5173

CMD ["pnpm" , "dev"]

