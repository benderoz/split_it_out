#!/bin/bash

# Скрипт для тестирования Telegram Mini App

set -e

echo "🧪 Тестирование Telegram Mini App для разделения счетов..."

# Проверка доступности приложения
echo "🔍 Проверка доступности приложения..."
if curl -f http://localhost:3000/ > /dev/null 2>&1; then
    echo "✅ Приложение доступно на http://localhost:3000"
else
    echo "❌ Приложение недоступно. Убедитесь что оно запущено."
    exit 1
fi

# Проверка основных endpoint'ов
echo "🔍 Проверка API endpoint'ов..."

# Проверка главной страницы
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/)
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ GET / - OK (200)"
else
    echo "❌ GET / - FAIL ($HTTP_CODE)"
fi

# Проверка статических файлов
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/style.css)
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ GET /style.css - OK (200)"
else
    echo "❌ GET /style.css - FAIL ($HTTP_CODE)"
fi

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/script.js)
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ GET /script.js - OK (200)"
else
    echo "❌ GET /script.js - FAIL ($HTTP_CODE)"
fi

# Проверка webhook endpoint (должен принимать POST)
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3000/webhook -H "Content-Type: application/json" -d '{"test": true}')
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ POST /webhook - OK (200)"
else
    echo "❌ POST /webhook - FAIL ($HTTP_CODE)"
fi

echo ""
echo "🔍 Проверка переменных окружения..."

# Проверка .env файла
if [ -f ".env" ]; then
    echo "✅ Файл .env найден"
    
    if grep -q "TELEGRAM_BOT_TOKEN" .env; then
        echo "✅ TELEGRAM_BOT_TOKEN настроен"
    else
        echo "⚠️ TELEGRAM_BOT_TOKEN не найден в .env"
    fi
    
    if grep -q "GEMINI_API_KEY" .env; then
        echo "✅ GEMINI_API_KEY настроен"
    else
        echo "⚠️ GEMINI_API_KEY не найден в .env"
    fi
else
    echo "❌ Файл .env не найден"
fi

echo ""
echo "🔍 Проверка Docker контейнеров..."

if command -v docker-compose &> /dev/null; then
    CONTAINERS=$(docker-compose ps -q)
    if [ ! -z "$CONTAINERS" ]; then
        echo "✅ Docker контейнеры запущены:"
        docker-compose ps --format table
    else
        echo "⚠️ Docker контейнеры не запущены"
    fi
else
    echo "⚠️ Docker Compose не установлен"
fi

echo ""
echo "🔍 Проверка логов (последние 10 строк)..."
if command -v docker-compose &> /dev/null && [ ! -z "$(docker-compose ps -q)" ]; then
    docker-compose logs --tail=10 bill-splitter
else
    echo "⚠️ Логи недоступны (контейнеры не запущены)"
fi

echo ""
echo "📊 Результаты тестирования:"
echo "   🌐 Web App: http://localhost:3000"
echo "   📋 Логи: docker-compose logs -f"
echo "   🛑 Остановка: docker-compose down"
echo ""

# Проверка Telegram Bot API (если токен настроен)
if [ ! -z "$TELEGRAM_BOT_TOKEN" ]; then
    echo "🤖 Проверка Telegram бота..."
    BOT_INFO=$(curl -s "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe")
    
    if echo "$BOT_INFO" | grep -q '"ok":true'; then
        BOT_USERNAME=$(echo "$BOT_INFO" | grep -o '"username":"[^"]*"' | cut -d'"' -f4)
        echo "✅ Telegram бот активен: @$BOT_USERNAME"
        
        # Проверка webhook
        WEBHOOK_INFO=$(curl -s "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo")
        if echo "$WEBHOOK_INFO" | grep -q '"url":"http'; then
            WEBHOOK_URL=$(echo "$WEBHOOK_INFO" | grep -o '"url":"[^"]*"' | cut -d'"' -f4)
            echo "✅ Webhook настроен: $WEBHOOK_URL"
        else
            echo "⚠️ Webhook не настроен"
        fi
    else
        echo "❌ Telegram бот недоступен (проверьте токен)"
    fi
fi

echo ""
echo "✅ Тестирование завершено!"