FROM node:18-alpine

# Установка системных зависимостей для Sharp
RUN apk add --no-cache \
    vips-dev \
    libc6-compat

WORKDIR /app

# Копируем package.json и устанавливаем зависимости
COPY package*.json ./
RUN npm ci --only=production

# Копируем исходный код
COPY . .

# Создаем директорию для загрузок
RUN mkdir -p uploads

# Устанавливаем права доступа
RUN chown -R node:node /app
USER node

# Открываем порт
EXPOSE 3000

# Команда запуска
CMD ["npm", "start"]