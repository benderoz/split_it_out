const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Создание директории для загрузок
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Базовые middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Логирование всех запросов
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body type:', typeof req.body);
  console.log('Content-Type:', req.get('Content-Type'));
  next();
});

// Статические файлы
app.use(express.static('public'));

// Настройка multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('Multer destination callback');
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    console.log('Multer filename callback, file:', file);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'receipt-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    console.log('Multer fileFilter, file:', file);
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Только изображения разрешены!'), false);
    }
  }
});

// Тестовые маршруты
app.get('/api/health', (req, res) => {
  console.log('Health check requested');
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  });
});

app.post('/api/test', (req, res) => {
  console.log('Test POST requested, body:', req.body);
  res.json({
    message: 'POST запрос работает',
    method: req.method,
    headers: req.headers,
    body: req.body
  });
});

// Маршрут для загрузки файлов - упрощенная версия
app.post('/api/upload-receipt', (req, res) => {
  console.log('=== UPLOAD RECEIPT REQUEST ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Content-Type:', req.get('Content-Type'));
  console.log('Headers:', req.headers);
  
  upload.single('receipt')(req, res, (err) => {
    console.log('=== MULTER CALLBACK ===');
    console.log('Error:', err);
    console.log('File:', req.file);
    
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({
        error: 'Ошибка загрузки файла',
        details: err.message,
        type: 'multer_error'
      });
    }

    if (!req.file) {
      console.log('No file received');
      return res.status(400).json({
        error: 'Файл не был загружен',
        type: 'no_file'
      });
    }

    console.log('File uploaded successfully:', req.file.filename);
    
    // Вместо реального анализа, возвращаем mock данные
    const mockData = {
      items: [
        {
          name: "Тестовая позиция 1",
          price: 100,
          top: 20,
          height: 4
        },
        {
          name: "Тестовая позиция 2", 
          price: 250,
          top: 40,
          height: 4
        }
      ],
      total: 350,
      currency: "RUB"
    };

    res.json({
      success: true,
      data: mockData,
      message: 'Файл успешно загружен (mock данные)',
      filename: req.file.filename
    });
  });
});

// Главная страница
app.get('/', (req, res) => {
  console.log('Main page requested');
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Обработка 404
app.use((req, res, next) => {
  console.log(`404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).json({
    error: 'Route not found',
    method: req.method,
    url: req.url
  });
});

// Обработка ошибок
app.use((error, req, res, next) => {
  console.error('=== GLOBAL ERROR ===');
  console.error('Error:', error);
  console.error('Stack:', error.stack);
  
  res.status(500).json({
    error: 'Внутренняя ошибка сервера',
    details: error.message,
    method: req.method,
    url: req.url
  });
});

// Запуск сервера
app.listen(port, () => {
  console.log('='.repeat(50));
  console.log(`🚀 DEBUG SERVER запущен на порту ${port}`);
  console.log(`📱 URL: http://localhost:${port}`);
  console.log(`📁 Uploads dir: ${uploadsDir}`);
  console.log('='.repeat(50));
});

module.exports = app;