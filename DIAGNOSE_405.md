# 🔍 Диагностика ошибки 405 Method Not Allowed

## Результаты тестирования

✅ **Сервер работает корректно:**
- GET `/api/health` - OK
- POST `/api/test` - OK  
- POST `/api/upload-receipt` с файлом - OK

**Проблема НЕ в серверной части!**

## Пошаговая диагностика

### 1. Запустить сервер
```bash
node server.js
```

### 2. Проверить основные API endpoints
```bash
# Health check
curl http://localhost:3000/api/health

# POST тест
curl -X POST http://localhost:3000/api/test \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'

# Загрузка файла
curl -X POST http://localhost:3000/api/upload-receipt \
  -F "receipt=@test-image.png"
```

### 3. Тестирование в браузере

Откройте в браузере: **http://localhost:3000/test-upload.html**

Эта страница:
- Автоматически проверит API
- Покажет подробные логи
- Позволит загрузить файл вручную

### 4. Проверка Telegram Mini App

Откройте: **http://localhost:3000**

1. Откройте DevTools (F12)
2. Перейдите на вкладку **Console**
3. Попробуйте загрузить файл
4. Посмотрите на ошибки в консоли

### 5. Проверка сетевых запросов

В DevTools:
1. Вкладка **Network**
2. Попробуйте загрузить файл
3. Найдите запрос к `/api/upload-receipt`
4. Посмотрите:
   - Статус код ответа
   - Request Headers
   - Response Headers
   - Request Payload

## Возможные причины ошибки 405

### 1. Проблема в клиентском коде
```javascript
// НЕПРАВИЛЬНО - неверный метод
fetch('/api/upload-receipt', {
    method: 'GET',  // ❌ Должен быть POST
    body: formData
});

// ПРАВИЛЬНО
fetch('/api/upload-receipt', {
    method: 'POST', // ✅ Правильный метод
    body: formData
});
```

### 2. Проблема с CORS
Если запрос идет с другого домена, добавьте CORS headers.

### 3. Проблема с middleware
Убедитесь что маршрут зарегистрирован до других middleware.

### 4. Проблема с кэшированием
Очистите кэш браузера или попробуйте в режиме инкогнито.

## Что делать если ошибка остается

### Шаг 1: Посмотрите логи сервера
```bash
# В отдельном терминале
tail -f server.log

# Или если запущен в консоли, смотрите вывод
```

### Шаг 2: Проверьте точный запрос
В DevTools → Network → найдите failed запрос:
- URL запроса
- Method
- Headers
- Payload

### Шаг 3: Сравните с рабочим curl
```bash
# Этот запрос ДОЛЖЕН работать:
curl -X POST http://localhost:3000/api/upload-receipt \
  -F "receipt=@test-image.png"
```

### Шаг 4: Проверьте разные браузеры
- Chrome
- Firefox
- Safari
- Мобильный браузер

## Логи для разработчика

Если проблема остается, пришлите:

1. **Логи сервера** (полный вывод консоли)
2. **Скриншот DevTools → Network** с failed запросом
3. **Скриншот DevTools → Console** с ошибками
4. **Браузер и версия**
5. **Операционная система**

## Быстрые тесты

```bash
# 1. Проверить что сервер запущен
curl http://localhost:3000/api/health

# 2. Если health не работает - проверить порт
netstat -tlnp | grep 3000

# 3. Если порт занят - найти процесс
lsof -i :3000

# 4. Перезапустить сервер
pkill -f "node server"
node server.js
```

## Решение найдено?

Если проблема в клиентском коде, исправьте метод запроса:

```javascript
// В public/script.js, функция analyzeReceipt()
const response = await fetch('/api/upload-receipt', {
    method: 'POST',  // ✅ Убедитесь что это POST
    body: formData   // ✅ FormData для файлов
});
```

---

**💡 Помните: ошибка 405 = неправильный HTTP метод для маршрута**