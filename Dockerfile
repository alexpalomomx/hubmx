# Etapa 1: Construcción (Build)
FROM node:20-alpine AS build

WORKDIR /app

# Copiamos archivos de dependencias para aprovechar el caché de capas de Docker
COPY package*.json ./
RUN npm install

# Copiamos el resto del código y generamos el build de producción
COPY . .
RUN npm run build

# Etapa 2: Servidor de Producción (Nginx)
FROM nginx:stable-alpine AS production

# Copiamos el resultado del build desde la etapa anterior a la carpeta de Nginx
# Vite por defecto exporta a la carpeta 'dist'
COPY --from=build /app/dist /usr/share/nginx/html

# Exponemos el puerto 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
