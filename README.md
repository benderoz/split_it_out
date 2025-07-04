# 💳 Telegram Mini App для разделения счетов

Веб-приложение для Telegram бота, которое позволяет легко разделять счета между друзьями с помощью OCR распознавания чеков.

## 🚀 Функциональность

- 📸 Фотографирование или загрузка чеков
- 🤖 OCR распознавание текста через Google Gemini API
- 🎨 Интерактивное выделение позиций цветными маркерами (iOS-подобное)
- 👥 Управление участниками (до 12 человек)
- 💰 Автоматический подсчет суммы для каждого участника
- 🔄 Разделение позиций между несколькими участниками
- 📤 Отправка результатов в Telegram чат
- 📱 Поддержка нескольких фотографий для длинных чеков

## 📋 Требования

- Node.js 16+ 
- Docker (опционально)
- Telegram Bot Token
- Google Gemini API Key

## ⚡ Быстрый запуск

### 1. Клонирование репозитория
```bash
git clone <repository-url>
cd bill-splitter-telegram-bot
```

### 2. Установка зависимостей
```bash
npm install
```

### 3. Настройка переменных окружения
Отредактируйте файл `.env`:
```env
TELEGRAM_BOT_TOKEN=7601237350:AAE_Gj-ZFcQIFzfc5HoHve29_IDmhOE1n0Q
GEMINI_API_KEY=AIzaSyC_x1YmkzV7cxFZp0zG6UgAmlKER-v8FFg
PORT=3000
NODE_ENV=production
WEBHOOK_URL=https://yourdomain.com
```

### 4. Запуск приложения
```bash
# Разработка
npm run dev

# Продакшн
npm start
```

## 🐳 Запуск через Docker

### Сборка и запуск контейнера
```bash
# Сборка образа
docker build -t bill-splitter .

# Запуск контейнера
docker run -p 3000:3000 --env-file .env bill-splitter
```

### Или использование docker-compose
```bash
docker-compose up -d
```

## 🔧 Настройка Telegram бота

### 1. Создание бота
1. Найдите @BotFather в Telegram
2. Используйте команду `/newbot`
3. Следуйте инструкциям для создания бота
4. Получите токен бота

### 2. Настройка Mini App
1. Используйте команду `/newapp` у @BotFather
2. Выберите ваш бот
3. Укажите URL: `https://yourdomain.com`
4. Загрузите иконку (512x512 px)
5. Добавьте описание

### 3. Настройка webhook
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://yourdomain.com/webhook"}'
```

## 🌐 Развертывание

### На VPS/Dedicated сервере
1. Установите Node.js и Docker
2. Клонируйте репозиторий
3. Настройте .env файл
4. Запустите через docker-compose
5. Настройте Nginx для HTTPS

### На Heroku
1. Создайте приложение на Heroku
2. Подключите GitHub репозиторий  
3. Добавьте переменные окружения в настройках
4. Разверните приложение

### На Railway/Render
1. Подключите GitHub репозиторий
2. Настройте переменные окружения
3. Разверните автоматически

## 🛠 Обход российских IP ограничений

Для работы с Gemini API из России используются несколько методов:

### 1. Прокси-серверы
Добавьте прокси в файл `proxy.js`:
```javascript
const US_PROXIES = [
    { host: 'proxy-host', port: 'port', auth: 'username:password' }
];
```

### 2. CloudFlare Workers
Разверните прокси на CloudFlare Workers и укажите URL в `.env`:
```env
CLOUDFLARE_WORKER_URL=https://your-worker.workers.dev
```

### 3. VPN/VPS за рубежом
Разверните приложение на зарубежном VPS.

## 📱 Использование

1. Отправьте команду `/start` боту
2. Нажмите кнопку "Открыть приложение"
3. Сфотографируйте или загрузите чек
4. Дождитесь анализа (5-10 секунд)
5. Выберите цвет участника и кликайте на позиции
6. При необходимости добавьте участников кнопкой "+"
7. Просмотрите итоги внизу экрана
8. Нажмите "Поделиться" для отправки результатов

## 🎨 Особенности интерфейса

- **iOS-подобное выделение**: Строки чека выделяются полупрозрачными цветными подложками
- **Интерактивные баблы**: Цены отображаются в удобных кликабельных элементах
- **Умное разделение**: Позиции автоматически делятся между участниками
- **Адаптивный дизайн**: Оптимизировано для мобильных устройств

## 🔍 API Endpoints

- `GET /` - Главная страница приложения
- `POST /api/upload-receipt` - Загрузка и анализ чека
- `POST /webhook` - Webhook для Telegram бота

## 📊 Формат данных OCR

```json
{
  "items": [
    {
      "name": "Кофе американо",
      "price": 250,
      "top": 15.5,
      "height": 3.2
    }
  ],
  "total": 250,
  "currency": "RUB"
}
```

## 🐛 Отладка

### Проверка webhook
```bash
curl -X GET "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

### Просмотр логов
```bash
# Docker
docker logs bill-splitter

# PM2
pm2 logs
```

### Тестирование OCR
Используйте endpoint `/api/upload-receipt` с Postman или curl для тестирования распознавания.

## 📝 Технологический стек

- **Backend**: Node.js, Express.js
- **Frontend**: Vanilla JavaScript, CSS3
- **OCR**: Google Gemini API
- **Telegram**: Bot API, Mini Apps
- **Deployment**: Docker, nginx
- **Image Processing**: Sharp

## 🤝 Поддержка

При возникновении проблем:
1. Проверьте логи приложения
2. Убедитесь в корректности API ключей
3. Проверьте доступность Gemini API
4. Создайте issue в репозитории

## 📄 Лицензия

MIT License - свободное использование и модификация.

---

**Создано для удобного разделения счетов между друзьями! 🍕💰**