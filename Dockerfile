# Imagen base de Node
FROM node:18

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos package.json y package-lock.json
COPY package*.json ./

# Instalamos solo dependencias necesarias para producción
RUN npm install --production

# Copiamos el resto del código
COPY . .

# Variable de entorno POR SI ACASO
ENV PORT=8080

# Exponemos el puerto
EXPOSE 8080

# Comando de inicio
CMD ["node", "index.js"]