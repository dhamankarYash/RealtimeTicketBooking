# (Your existing setup at the top...)
FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm install

# Copy all your code and the Prisma schema into Docker
COPY . .

# 🛠️ THE MAGIC FIX: Tell Docker to build the Prisma client!
RUN npx prisma generate

# Build the TypeScript code
RUN npm run build

EXPOSE 5000
CMD ["npm", "start"]