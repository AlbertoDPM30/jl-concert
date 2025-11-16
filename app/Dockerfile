FROM node:18-alpine

WORKDIR /app

# Copiar package.json e instalar dependencias
COPY package*.json ./
RUN npm ci --only=production

# Copiar el resto de la aplicación
COPY . .

# Build de la aplicación
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]