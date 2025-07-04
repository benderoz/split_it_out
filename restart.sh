#!/bin/bash

# Скрипт для перезапуска приложения после исправлений

set -e

echo "🔄 Перезапуск приложения с исправлениями..."

# Остановка контейнеров
echo "🛑 Остановка контейнеров..."
docker-compose down || true

# Очистка старых образов
echo "🧹 Очистка старых образов..."
docker system prune -f

# Сборка и запуск
echo "🔨 Пересборка и запуск..."
docker-compose build --no-cache
docker-compose up -d

# Ожидание запуска
echo "⏳ Ожидание запуска приложения..."
sleep 15

# Проверка состояния
echo "🔍 Проверка состояния..."
docker-compose ps

# Тестирование API
echo "🧪 Тестирование API endpoints..."

echo "Testing /api/health..."
curl -s http://localhost:3000/api/health | jq . || echo "Health check failed"

echo "Testing /api/test..."
curl -s -X POST http://localhost:3000/api/test \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}' | jq . || echo "Test endpoint failed"

echo "Testing main page..."
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ || echo "Main page failed"

# Показ логов
echo "📋 Последние логи:"
docker-compose logs --tail=20

echo ""
echo "✅ Перезапуск завершен!"
echo "🌐 Приложение доступно: http://localhost:3000"
echo "📱 Откройте в браузере для тестирования"
echo ""
echo "🔧 Для отладки:"
echo "   Логи: docker-compose logs -f"
echo "   Консоль: docker-compose exec bill-splitter /bin/sh"
echo ""