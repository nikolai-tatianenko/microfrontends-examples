# Use a specific tag for the base image
FROM node:14-alpine

# Create a non-root user
RUN addgroup -S myuser && adduser -S myuser -G myuser

# Set the working directory
WORKDIR /code

# Copy package.json and package-lock.json
COPY ./* ./

# Install app dependencies
RUN npm install
#
## Copy the application source code
#COPY ./src ./src

# Set ownership and permissions
RUN chown -R myuser:myuser /code
RUN chmod -R 755 /code

# Switch to the non-root user
USER myuser

# Set the default value for the PORT environment variable
ENV PORT=8080

# Expose the port
EXPOSE $PORT

# Start the application
CMD ["npm", "start"]
