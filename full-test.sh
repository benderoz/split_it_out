#!/bin/bash

# Полная диагностика проблемы с 405 ошибкой

set -e

echo "🔍 ПОЛНАЯ ДИАГНОСТИКА ПРОБЛЕМЫ 405"
echo "=================================="
echo ""

# Проверка сервера
echo "1. 🔍 Проверка статуса сервера..."
if curl -s -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ Сервер запущен и доступен"
    curl -s http://localhost:3000/api/health | jq . 2>/dev/null || curl -s http://localhost:3000/api/health
else
    echo "❌ Сервер недоступен на порту 3000"
    echo "🔧 Запустите сервер: node server.js"
    exit 1
fi

echo ""
echo "2. 🧪 Тестирование API endpoints..."

# Тест GET запроса
echo "   Health check..."
if curl -s -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "   ✅ GET /api/health - OK"
else
    echo "   ❌ GET /api/health - FAILED"
fi

# Тест POST запроса
echo "   POST тест..."
if curl -s -f -X POST http://localhost:3000/api/test \
    -H "Content-Type: application/json" \
    -d '{"test": "data"}' > /dev/null 2>&1; then
    echo "   ✅ POST /api/test - OK"
else
    echo "   ❌ POST /api/test - FAILED"
fi

# Создание тестового файла если не существует
if [ ! -f "test-image.png" ]; then
    echo "   Создаю тестовое изображение..."
    echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==" | base64 -d > test-image.png
fi

# Тест загрузки файла
echo "   File upload тест..."
UPLOAD_RESULT=$(curl -s -w "%{http_code}" -X POST http://localhost:3000/api/upload-receipt \
    -F "receipt=@test-image.png" -o /tmp/upload_response.json)

HTTP_CODE="${UPLOAD_RESULT: -3}"
if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ POST /api/upload-receipt - OK (HTTP $HTTP_CODE)"
    echo "   📄 Ответ: $(cat /tmp/upload_response.json)"
else
    echo "   ❌ POST /api/upload-receipt - FAILED (HTTP $HTTP_CODE)"
    echo "   📄 Ответ: $(cat /tmp/upload_response.json)"
fi

echo ""
echo "3. 📊 Результаты диагностики:"
echo ""

if [ "$HTTP_CODE" = "200" ]; then
    echo "🎉 СЕРВЕРНАЯ ЧАСТЬ РАБОТАЕТ КОРРЕКТНО!"
    echo ""
    echo "📌 Проблема НЕ в сервере. Возможные причины:"
    echo ""
    echo "   🌐 Проблема в браузере/клиенте:"
    echo "      • Кэш браузера"
    echo "      • Неправильный метод в JavaScript"
    echo "      • CORS проблемы"
    echo "      • Расширения браузера"
    echo ""
    echo "   🔧 Что делать:"
    echo "      1. Откройте http://localhost:3000/test-upload.html"
    echo "      2. Проверьте загрузку файла в тестовой странице"
    echo "      3. Откройте DevTools (F12) в основном приложении"
    echo "      4. Посмотрите вкладку Network при загрузке файла"
    echo "      5. Проверьте Console на наличие JavaScript ошибок"
    echo ""
    echo "   📱 Telegram Mini App:"
    echo "      1. Откройте http://localhost:3000"
    echo "      2. Откройте DevTools (F12)"
    echo "      3. Попробуйте загрузить файл"
    echo "      4. Проверьте Network tab на метод запроса"
    echo ""
else
    echo "❌ СЕРВЕРНАЯ ПРОБЛЕМА ОБНАРУЖЕНА!"
    echo ""
    echo "🔧 Что делать:"
    echo "   1. Перезапустите сервер: node server.js"
    echo "   2. Проверьте логи сервера на ошибки"
    echo "   3. Убедитесь что все зависимости установлены: npm install"
    echo ""
fi

echo "📋 Дополнительная информация:"
echo "   📄 Подробная диагностика: cat DIAGNOSE_405.md"
echo "   🧪 Тестовая страница: http://localhost:3000/test-upload.html"
echo "   📱 Основное приложение: http://localhost:3000"
echo ""

# Проверка процессов
echo "4. 🔍 Проверка запущенных процессов..."
NODE_PROCESSES=$(ps aux | grep "node server" | grep -v grep | wc -l)
if [ "$NODE_PROCESSES" -gt 0 ]; then
    echo "   ✅ Найдено $NODE_PROCESSES Node.js процессов"
    ps aux | grep "node server" | grep -v grep
else
    echo "   ⚠️ Node.js сервер не найден в процессах"
fi

echo ""
echo "=================================="
echo "🏁 Диагностика завершена!"

# Очистка
rm -f /tmp/upload_response.json test-image.png 2>/dev/null || true