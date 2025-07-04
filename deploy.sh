#!/bin/bash

# Скрипт для развертывания Telegram Mini App

set -e

echo "🚀 Начинаем развертывание Telegram Mini App для разделения счетов..."

# Проверка наличия необходимых файлов
if [ ! -f ".env" ]; then
    echo "❌ Файл .env не найден!"
    echo "📝 Создайте файл .env на основе .env.example"
    exit 1
fi

# Проверка Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен!"
    echo "📝 Установите Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

# Проверка docker-compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose не установлен!"
    echo "📝 Установите Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Все зависимости установлены"

# Остановка существующих контейнеров
echo "🛑 Остановка существующих контейнеров..."
docker-compose down || true

# Сборка образа
echo "🔨 Сборка Docker образа..."
docker-compose build --no-cache

# Запуск приложения
echo "▶️ Запуск приложения..."
docker-compose up -d

# Проверка статуса
echo "🔍 Проверка статуса контейнеров..."
docker-compose ps

# Ожидание запуска
echo "⏳ Ожидание запуска приложения..."
sleep 10

# Проверка здоровья приложения
if curl -f http://localhost:3000/ > /dev/null 2>&1; then
    echo "✅ Приложение успешно запущено!"
    echo "🌐 URL: http://localhost:3000"
else
    echo "❌ Ошибка запуска приложения"
    echo "📋 Логи:"
    docker-compose logs --tail=20
    exit 1
fi

# Настройка webhook (если указан WEBHOOK_URL)
if [ ! -z "$WEBHOOK_URL" ] && [ ! -z "$TELEGRAM_BOT_TOKEN" ]; then
    echo "🔗 Настройка Telegram webhook..."
    curl -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook" \
         -H "Content-Type: application/json" \
         -d "{\"url\": \"${WEBHOOK_URL}/webhook\"}" || echo "⚠️ Не удалось установить webhook"
fi

echo ""
echo "🎉 Развертывание завершено!"
echo ""
echo "📋 Полезные команды:"
echo "   Просмотр логов:    docker-compose logs -f"
echo "   Остановка:         docker-compose down"
echo "   Перезапуск:        docker-compose restart"
echo "   Обновление:        git pull && ./deploy.sh"
echo ""
echo "🔧 Настройка бота:"
echo "   1. Найдите @BotFather в Telegram"
echo "   2. Используйте /newapp для создания Mini App"
echo "   3. Укажите URL: ${WEBHOOK_URL:-http://your-domain.com}"
echo ""