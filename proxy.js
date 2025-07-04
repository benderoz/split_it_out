const axios = require('axios');
const { createProxyMiddleware } = require('http-proxy-middleware');

// Список американских прокси-серверов (можно использовать платные сервисы)
const US_PROXIES = [
    { host: '20.127.185.209', port: '8080'},
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
