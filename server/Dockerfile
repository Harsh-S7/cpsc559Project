FROM hoxirious/node:latest

RUN npm i -g pnpm
# Set the working directory in the container

WORKDIR /app/server

# Copy the package.json and package-lock.json files to the container
COPY package.json nodemon.json ./

# Install dependencies
RUN pnpm install

# Copy the rest of the application code to the container
COPY . .

# Expose port 3001 and 3002
EXPOSE 3001
EXPOSE 3002

# Command to run the application
CMD ["pnpm", "start"]



