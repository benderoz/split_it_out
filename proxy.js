const axios = require('axios');
const { createProxyMiddleware } = require('http-proxy-middleware');

// Список американских прокси-серверов (можно использовать платные сервисы)
const US_PROXIES = [
    { host: '193.31.127.35', port: '8080', auth: 'USKA4TOD1:zZvkURsE' },
    { host: '45.147.234.150', port: '8080', auth: 'USKA4TOD1:zZvkURsE' },
    { host: '45.145.129.237', port: '8080', auth: 'USKA4TOD1:zZvkURsE' },
    { host: '193.233.229.106', port: '8080', auth: 'USKA4TOD1:zZvkURsE' },
    { host: '193.56.20.153', port: '8080', auth: 'USKA4TOD1:zZvkURsE' },
    { host: '45.145.129.202', port: '8080', auth: 'USKA4TOD1:zZvkURsE' },
    { host: '88.218.46.192', port: '8080', auth: 'USKA4TOD1:zZvkURsE' },
    { host: '45.80.107.37', port: '8080', auth: 'USKA4TOD1:zZvkURsE' },
    { host: '45.66.209.93', port: '8080', auth: 'USKA4TOD1:zZvkURsE' },
    { host: '91.132.124.80', port: '8080', auth: 'USKA4TOD1:zZvkURsE' },
    { host: '45.132.185.97', port: '8080', auth: 'USKA4TOD1:zZvkURsE' },
    { host: '193.163.92.244', port: '8080', auth: 'USKA4TOD1:zZvkURsE' },
    { host: '83.171.225.231', port: '8080', auth: 'USKA4TOD1:zZvkURsE' },
    { host: '45.145.129.241', port: '8080', auth: 'USKA4TOD1:zZvkURsE' },
    { host: '140.235.3.181', port: '8080', auth: 'USKA4TOD1:zZvkURsE' },
    { host: '45.147.233.15', port: '8080', auth: 'USKA4TOD1:zZvkURsE' },
    { host: '45.136.27.33', port: '8080', auth: 'USKA4TOD1:zZvkURsE' },
    { host: '194.99.25.221', port: '8080', auth: 'USKA4TOD1:zZvkURsE' },
    { host: '45.133.112.138', port: '8080', auth: 'USKA4TOD1:zZvkURsE' },
    { host: '194.99.25.197', port: '8080', auth: 'USKA4TOD1:zZvkURsE' },
    { host: '89.19.34.32', port: '8080', auth: 'USKA4TOD1:zZvkURsE' },
    { host: '140.235.1.42', port: '8080', auth: 'USKA4TOD1:zZvkURsE' },
    { host: '93.177.94.58', port: '8080', auth: 'USKA4TOD1:zZvkURsE' },
    { host: '185.88.101.172', port: '8080', auth: 'USKA4TOD1:zZvkURsE' },
    { host: '45.147.10.106', port: '8080', auth: 'USKA4TOD1:zZvkURsE' },
    { host: '45.147.232.48', port: '8080', auth: 'USKA4TOD1:zZvkURsE' },
    { host: '45.132.185.238', port: '8080', auth: 'USKA4TOD1:zZvkURsE' },
    { host: '193.142.36.55', port: '8080', auth: 'USKA4TOD1:zZvkURsE' },
    { host: '45.147.11.238', port: '8080', auth: 'USKA4TOD1:zZvkURsE' },
    { host: '85.239.58.131', port: '8080', auth: 'USKA4TOD1:zZvkURsE' },
    { host: '193.56.20.144', port: '8080', auth: 'USKA4TOD1:zZvkURsE' },
    { host: '193.163.92.21', port: '8080', auth: 'USKA4TOD1:zZvkURsE' },
    { host: '185.94.33.125', port: '8080', auth: 'USKA4TOD1:zZvkURsE' },
    { host: '45.147.233.214', port: '8080', auth: 'USKA4TOD1:zZvkURsE' },
    { host: '45.145.129.125', port: '8080', auth: 'USKA4TOD1:zZvkURsE' },
    { host: '176.126.111.240', port: '8080', auth: 'USKA4TOD1:zZvkURsE' },
    { host: '193.142.38.81', port: '8080', auth: 'USKA4TOD1:zZvkURsE' },
    { host: '85.239.59.37', port: '8080', auth: 'USKA4TOD1:zZvkURsE' },
    { host: '85.239.56.201', port: '8080', auth: 'USKA4TOD1:zZvkURsE' },
    { host: '45.80.107.95', port: '8080', auth: 'USKA4TOD1:zZvkURsE' },
    { host: '85.239.56.215', port: '8080', auth: 'USKA4TOD1:zZvkURsE' },
    { host: '140.235.1.80', port: '8080', auth: 'USKA4TOD1:zZvkURsE' },
    { host: '140.235.3.241', port: '8080', auth: 'USKA4TOD1:zZvkURsE' },
    { host: '45.136.26.215', port: '8080', auth: 'USKA4TOD1:zZvkURsE' },
    { host: '64.49.38.64', port: '8080', auth: 'USKA4TOD1:zZvkURsE' },
    { host: '194.180.237.71', port: '8080', auth: 'USKA4TOD1:zZvkURsE' },
    { host: '45.66.209.227', port: '8080', auth: 'USKA4TOD1:zZvkURsE' },
    { host: '213.108.1.68', port: '8080', auth: 'USKA4TOD1:zZvkURsE' },
    { host: '193.233.210.209', port: '8080', auth: 'USKA4TOD1:zZvkURsE' },
    { host: '193.142.38.124', port: '8080', auth: 'USKA4TOD1:zZvkURsE' }
    // Можно добавить здесь настоящие прокси, например от proxy-cheap.com, bright data, etc.
    // Формат: { host: 'proxy-host', port: 'port', auth: 'username:password' }
];

// Конфигурация для обхода российских ограничений
const PROXY_CONFIG = {
    // Используем публичные американские DNS
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Origin': 'https://aistudio.google.com',
        'Referer': 'https://aistudio.google.com/'
    },
    timeout: 30000
};

// Функция для создания прокси-запроса к Gemini API
async function makeGeminiRequest(apiKey, requestData) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    try {
        // Вариант 1: Простой запрос (может работать если нет блокировки)
        const response = await axios.post(url, requestData, {
            ...PROXY_CONFIG,
            headers: {
                ...PROXY_CONFIG.headers,
                'Content-Type': 'application/json'
            }
        });
        
        return response.data;
        
    } catch (error) {
        // Если прямой запрос не работает, пробуем через прокси
        if (US_PROXIES.length > 0) {
            console.log('Прямой запрос не удался, пробуем через прокси...');
            return await makeProxyRequest(url, requestData);
        }
        
        throw error;
    }
}

// Функция для запроса через прокси
async function makeProxyRequest(url, requestData) {
    for (const proxy of US_PROXIES) {
        try {
            const proxyConfig = {
                ...PROXY_CONFIG,
                proxy: {
                    host: proxy.host,
                    port: proxy.port,
                    auth: proxy.auth ? {
                        username: proxy.auth.split(':')[0],
                        password: proxy.auth.split(':')[1]
                    } : undefined
                }
            };
            
            const response = await axios.post(url, requestData, proxyConfig);
            console.log(`Успешный запрос через прокси: ${proxy.host}`);
            return response.data;
            
        } catch (error) {
            console.warn(`Прокси ${proxy.host} не работает:`, error.message);
            continue;
        }
    }
    
    throw new Error('Все прокси недоступны');
}

// Middleware для Express для проксирования запросов к Gemini
function createGeminiProxy() {
    return createProxyMiddleware({
        target: 'https://generativelanguage.googleapis.com',
        changeOrigin: true,
        pathRewrite: {
            '^/api/gemini': '/v1beta/models/gemini-1.5-flash:generateContent'
        },
        onProxyReq: (proxyReq, req, res) => {
            // Добавляем заголовки для обхода блокировки
            proxyReq.setHeader('User-Agent', PROXY_CONFIG.headers['User-Agent']);
            proxyReq.setHeader('Accept-Language', 'en-US,en;q=0.9');
            proxyReq.setHeader('Origin', 'https://aistudio.google.com');
            proxyReq.setHeader('Referer', 'https://aistudio.google.com/');
        },
        onError: (err, req, res) => {
            console.error('Ошибка прокси:', err);
            res.status(500).json({ 
                error: 'Прокси недоступен', 
                details: err.message 
            });
        }
    });
}

// Альтернативный метод через CloudFlare Workers (можно развернуть отдельно)
const CLOUDFLARE_WORKER_PROXY = process.env.CLOUDFLARE_WORKER_URL;

async function makeCloudflareRequest(apiKey, requestData) {
    if (!CLOUDFLARE_WORKER_PROXY) {
        throw new Error('CloudFlare Worker не настроен');
    }
    
    const response = await axios.post(CLOUDFLARE_WORKER_PROXY, {
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    }, {
        timeout: 30000
    });
    
    return response.data;
}

module.exports = {
    makeGeminiRequest,
    createGeminiProxy,
    makeCloudflareRequest
};
