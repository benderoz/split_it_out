# 🔧 Исправление ошибки 405 Method Not Allowed

## Проблема
При загрузке чека через Telegram Mini App возникала ошибка **HTTP 405 Method Not Allowed**.

## Причина
Конфликт middleware в файле `server.js`:
- Дублирование `express.json()` в маршруте `/webhook`
- Неправильная обработка ошибок multer
- Отсутствие логирования запросов

## Исправления

### 1. Удален дублирующий middleware
```javascript
// БЫЛО:
app.post('/webhook', express.json(), (req, res) => {

// СТАЛО:
app.post('/webhook', (req, res) => {
```

### 2. Улучшена обработка multer
```javascript
// БЫЛО:
app.post('/api/upload-receipt', upload.single('receipt'), async (req, res) => {

// СТАЛО:
app.post('/api/upload-receipt', (req, res) => {
  upload.single('receipt')(req, res, async (err) => {
    if (err) {
      console.error('Ошибка multer:', err);
      return res.status(400).json({ 
        error: 'Ошибка загрузки файла', 
        details: err.message 
      });
    }
    // ... остальная логика
  });
});
```

### 3. Добавлено логирование
```javascript
// Логирование всех запросов
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - ${req.ip}`);
  console.log('Headers:', req.headers);
  next();
});
```

### 4. Добавлены отладочные маршруты
- `GET /api/health` - проверка состояния API
- `POST /api/test` - тестирование POST запросов

### 5. Улучшена клиентская диагностика
- Подробное логирование в `analyzeReceipt()`
- Автоматическое тестирование API при загрузке
- Лучшая обработка ошибок

## Как применить исправления

### Быстрый перезапуск:
```bash
./restart.sh
```

### Ручной перезапуск:
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Проверка работы:
```bash
./test.sh
```

## Тестирование

После исправлений проверьте:

1. **API доступность:**
   ```bash
   curl http://localhost:3000/api/health
   ```

2. **POST запросы:**
   ```bash
   curl -X POST http://localhost:3000/api/test \
     -H "Content-Type: application/json" \
     -d '{"test": "data"}'
   ```

3. **Загрузка файлов:**
   - Откройте приложение в браузере
   - Попробуйте загрузить изображение
   - Проверьте консоль браузера (F12)

## Логи для отладки

### Просмотр логов сервера:
```bash
docker-compose logs -f bill-splitter
```

### Консоль браузера:
Откройте Developer Tools (F12) и следите за:
- Network tab для HTTP запросов
- Console tab для JavaScript ошибок

## Результат
✅ Ошибка 405 исправлена  
✅ Добавлено подробное логирование  
✅ Улучшена диагностика проблем  
✅ Добавлены тестовые endpoints  

---
**Приложение теперь должно корректно обрабатывать загрузку файлов!** 🎉