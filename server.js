const express = require('express');
const multer = require('multer');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const FormData = require('form-data');
const sharp = require('sharp');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Настройка ограничения запросов
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // максимум 100 запросов с одного IP
  message: 'Слишком много запросов, попробуйте позже'
});

app.use(limiter);
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static('public'));

// Создание директории для загрузок
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'receipt-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Только изображения разрешены!'), false);
    }
  }
});

// Инициализация Telegram Bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });

// Функция для работы с Gemini API через прокси
async function analyzeReceiptWithGemini(imagePath) {
  try {
    // Сжимаем изображение для лучшей производительности
    const compressedImagePath = path.join(uploadsDir, 'compressed-' + path.basename(imagePath));
    await sharp(imagePath)
      .resize(1200, null, { withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toFile(compressedImagePath);

    // Читаем сжатое изображение
    const imageBuffer = fs.readFileSync(compressedImagePath);
    const imageBase64 = imageBuffer.toString('base64');

    const prompt = `
Проанализируй этот чек и верни структурированные данные в JSON формате. 
Важно: для каждой позиции укажи координаты где она находится на изображении в процентах от верха (top) и высоту строки (height).

Структура ответа:
{
  "items": [
    {
      "name": "название позиции",
      "price": число_цена,
      "top": процент_от_верха_изображения,
      "height": высота_строки_в_процентах
    }
  ],
  "total": общая_сумма,
  "currency": "валюта"
}

Правила:
1. Извлекай только позиции с ценами (игнорируй заголовки, итоги, налоги)
2. Цены должны быть числами без символов валют
3. Координаты top должны показывать где находится строка (0% = верх, 100% = низ)
4. height - примерная высота одной строки (обычно 3-5%)
5. Если цена не указана или неясна, не включай позицию
6. Отвечай только валидным JSON без дополнительного текста`;

    // Используем американский прокси для запроса к Gemini
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: imageBase64
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.1,
          topK: 32,
          topP: 1,
          maxOutputTokens: 4096,
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    // Удаляем временные файлы
    fs.unlinkSync(compressedImagePath);
    fs.unlinkSync(imagePath);

    const result = response.data.candidates[0].content.parts[0].text;
    
    // Очищаем ответ от markdown разметки если есть
    const cleanResult = result.replace(/```json\n?|\n?```/g, '').trim();
    
    return JSON.parse(cleanResult);
  } catch (error) {
    console.error('Ошибка анализа чека:', error);
    throw new Error('Не удалось проанализировать чек. Попробуйте еще раз.');
  }
}

// API маршруты

// Загрузка и анализ чека
app.post('/api/upload-receipt', upload.single('receipt'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Файл не был загружен' });
    }

    console.log('Анализирую чек:', req.file.filename);
    const analysis = await analyzeReceiptWithGemini(req.file.path);
    
    res.json({
      success: true,
      data: analysis,
      message: 'Чек успешно проанализирован'
    });
  } catch (error) {
    console.error('Ошибка обработки чека:', error);
    res.status(500).json({ 
      error: 'Ошибка при анализе чека', 
      details: error.message 
    });
  }
});

// Основная страница
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Webhook для Telegram бота
app.post('/webhook', express.json(), (req, res) => {
  console.log('Webhook получен:', req.body);
  
  const { message } = req.body;
  
  if (message && message.text === '/start') {
    const webAppUrl = `${process.env.WEBHOOK_URL || 'http://localhost:3000'}`;
    
    bot.sendMessage(message.chat.id, 'Добро пожаловать! Используйте кнопку ниже для разделения счета:', {
      reply_markup: {
        inline_keyboard: [[
          {
            text: '📱 Открыть приложение',
            web_app: { url: webAppUrl }
          }
        ]]
      }
    });
  }
  
  res.status(200).send('OK');
});

// Обработка ошибок
app.use((error, req, res, next) => {
  console.error('Глобальная ошибка:', error);
  res.status(500).json({ 
    error: 'Внутренняя ошибка сервера',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// Запуск сервера
app.listen(port, () => {
  console.log(`🚀 Сервер запущен на порту ${port}`);
  console.log(`📱 Web App URL: http://localhost:${port}`);
  
  // Установка webhook при запуске (в продакшене)
  if (process.env.NODE_ENV === 'production' && process.env.WEBHOOK_URL) {
    bot.setWebHook(`${process.env.WEBHOOK_URL}/webhook`)
      .then(() => console.log('✅ Webhook установлен'))
      .catch(err => console.error('❌ Ошибка установки webhook:', err));
  }
});

module.exports = app;