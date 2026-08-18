FROM node:18-alpine

# Install smbclient for backup uploads to Windows share
RUN apk add --no-cache samba-client

WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .

# Ensure backup script is executable
RUN chmod +x /app/backup.sh

EXPOSE 3000
CMD ["node", "server.js"]
