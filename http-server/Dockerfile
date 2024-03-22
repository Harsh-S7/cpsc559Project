FROM hoxirious/node:latest

RUN npm i -g pnpm
# Set the working directory in the container

WORKDIR /app/server-user

# Copy the package.json and package-lock.json files to the container
COPY package.json pnpm-lock.yaml nodemon.json tsconfig.json ./

# Install dependencies
RUN pnpm install

# Copy the rest of the application code to the container
COPY . .

RUN npm run build

# Expose port 3003
EXPOSE 3003

# Command to run the application
CMD ["pnpm", "start"]



