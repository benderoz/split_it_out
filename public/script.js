// Инициализация Telegram WebApp
const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

// Глобальные переменные
let currentReceiptData = null;
let currentActiveColor = '#ff6b6b';
let currentActiveColorIndex = 0;
let guests = [
    { name: 'Участник 1', color: '#ff6b6b', total: 0 },
    { name: 'Участник 2', color: '#4ecdc4', total: 0 },
    { name: 'Участник 3', color: '#45b7d1', total: 0 }
];
let receiptItems = [];
let uploadedReceipts = [];

// Цвета для участников
const availableColors = [
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', 
    '#ffeaa7', '#dda0dd', '#98d8c8', '#fab1a0',
    '#fd79a8', '#6c5ce7', '#a29bfe', '#ff7675'
];

// DOM элементы
const uploadScreen = document.getElementById('uploadScreen');
const analysisScreen = document.getElementById('analysisScreen');
const loadingScreen = document.getElementById('loadingScreen');
const receiptInput = document.getElementById('receiptInput');
const receiptImage = document.getElementById('receiptImage');
const receiptOverlay = document.getElementById('receiptOverlay');
const colorSelectors = document.querySelectorAll('.color-selector');
const addGuestBtn = document.getElementById('addGuestBtn');
const backBtn = document.getElementById('backBtn');
const shareBtn = document.getElementById('shareBtn');
const summaryList = document.getElementById('summaryList');
const totalAmount = document.getElementById('totalAmount');
const receiptsList = document.getElementById('receiptsList');
const addReceiptBtn = document.getElementById('addReceiptBtn');
const guestModal = document.getElementById('guestModal');
const guestNameInput = document.getElementById('guestNameInput');
const confirmGuestBtn = document.getElementById('confirmGuestBtn');
const cancelGuestBtn = document.getElementById('cancelGuestBtn');

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupEventListeners();
    updateColorPanel();
    updateSummary();
}

function setupEventListeners() {
    // Загрузка фото
    receiptInput.addEventListener('change', handleFileUpload);
    
    // Цветовая панель
    colorSelectors.forEach((selector, index) => {
        selector.addEventListener('click', () => selectColor(index));
    });
    
    // Кнопки
    addGuestBtn.addEventListener('click', showAddGuestModal);
    backBtn.addEventListener('click', showUploadScreen);
    shareBtn.addEventListener('click', shareResults);
    addReceiptBtn.addEventListener('click', () => receiptInput.click());
    
    // Модальное окно
    confirmGuestBtn.addEventListener('click', addNewGuest);
    cancelGuestBtn.addEventListener('click', hideAddGuestModal);
    guestNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addNewGuest();
    });
    
    // Закрытие модального окна по клику вне его
    guestModal.addEventListener('click', (e) => {
        if (e.target === guestModal) hideAddGuestModal();
    });
}

async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
        showLoading(true);
        
        // Создаем превью изображения
        const imageUrl = URL.createObjectURL(file);
        const receiptData = {
            id: Date.now(),
            file: file,
            imageUrl: imageUrl,
            name: file.name,
            uploadTime: new Date().toLocaleString()
        };
        
        uploadedReceipts.push(receiptData);
        updateReceiptsList();
        
        // Анализируем чек
        await analyzeReceipt(file);
        
    } catch (error) {
        console.error('Ошибка загрузки файла:', error);
        showError('Ошибка при загрузке файла: ' + error.message);
    } finally {
        showLoading(false);
        receiptInput.value = ''; // Сбрасываем input для повторного выбора
    }
}

async function analyzeReceipt(file) {
    try {
        const formData = new FormData();
        formData.append('receipt', file);
        
        const response = await fetch('/api/upload-receipt', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'Ошибка анализа чека');
        }
        
        currentReceiptData = result.data;
        receiptItems = currentReceiptData.items.map((item, index) => ({
            ...item,
            id: index,
            selectedBy: []
        }));
        
        showAnalysisScreen();
        displayReceiptWithItems();
        updateSummary();
        
    } catch (error) {
        console.error('Ошибка анализа чека:', error);
        showError('Не удалось проанализировать чек: ' + error.message);
    }
}

function displayReceiptWithItems() {
    if (!currentReceiptData || uploadedReceipts.length === 0) return;
    
    const lastReceipt = uploadedReceipts[uploadedReceipts.length - 1];
    receiptImage.src = lastReceipt.imageUrl;
    receiptImage.onload = () => {
        createInteractiveElements();
    };
}

function createInteractiveElements() {
    receiptOverlay.innerHTML = '';
    
    if (!receiptItems || receiptItems.length === 0) return;
    
    const imageRect = receiptImage.getBoundingClientRect();
    const imageHeight = receiptImage.offsetHeight;
    
    receiptItems.forEach((item, index) => {
        // Создаем выделение строки (iOS-подобное)
        const highlight = document.createElement('div');
        highlight.className = 'receipt-highlight';
        highlight.style.top = `${item.top}%`;
        highlight.style.left = '5%';
        highlight.style.width = '90%';
        highlight.style.height = `${item.height || 4}%`;
        highlight.style.display = 'none';
        receiptOverlay.appendChild(highlight);
        
        // Создаем интерактивный баббл
        const bubble = document.createElement('div');
        bubble.className = 'receipt-item-bubble';
        bubble.textContent = `${item.price} ₽`;
        bubble.style.top = `${item.top + (item.height || 4) / 2}%`;
        bubble.style.left = '75%';
        bubble.style.transform = 'translateY(-50%)';
        
        bubble.addEventListener('click', () => toggleItemSelection(index));
        
        receiptOverlay.appendChild(bubble);
        
        // Сохраняем ссылки на элементы
        item.highlightElement = highlight;
        item.bubbleElement = bubble;
    });
    
    updateItemsDisplay();
}

function toggleItemSelection(itemIndex) {
    const item = receiptItems[itemIndex];
    const currentGuestIndex = currentActiveColorIndex;
    
    if (item.selectedBy.includes(currentGuestIndex)) {
        // Убираем выделение
        item.selectedBy = item.selectedBy.filter(i => i !== currentGuestIndex);
    } else {
        // Добавляем выделение
        item.selectedBy.push(currentGuestIndex);
    }
    
    updateItemsDisplay();
    updateSummary();
}

function updateItemsDisplay() {
    receiptItems.forEach(item => {
        const highlight = item.highlightElement;
        const bubble = item.bubbleElement;
        
        if (item.selectedBy.length > 0) {
            // Показываем выделение с цветом первого участника
            const colorIndex = item.selectedBy[0];
            highlight.style.display = 'block';
            highlight.className = `receipt-highlight color-${colorIndex + 1}`;
            
            // Обновляем баббл
            bubble.style.backgroundColor = guests[colorIndex].color;
            bubble.style.color = 'white';
            bubble.style.borderColor = guests[colorIndex].color;
            bubble.classList.add('selected');
            
            // Если позиция выбрана несколькими участниками
            if (item.selectedBy.length > 1) {
                bubble.textContent = `${item.price} ₽ (${item.selectedBy.length})`;
            } else {
                bubble.textContent = `${item.price} ₽`;
            }
        } else {
            // Убираем выделение
            highlight.style.display = 'none';
            bubble.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            bubble.style.color = '#333';
            bubble.style.borderColor = '#ddd';
            bubble.classList.remove('selected');
            bubble.textContent = `${item.price} ₽`;
        }
    });
}

function selectColor(colorIndex) {
    if (colorIndex >= guests.length) return;
    
    currentActiveColorIndex = colorIndex;
    currentActiveColor = guests[colorIndex].color;
    
    // Обновляем активный цвет в UI
    colorSelectors.forEach((selector, index) => {
        selector.classList.toggle('active', index === colorIndex);
    });
}

function updateColorPanel() {
    const colorsContainer = document.querySelector('.colors-container');
    colorsContainer.innerHTML = '';
    
    guests.forEach((guest, index) => {
        const selector = document.createElement('div');
        selector.className = `color-selector ${index === currentActiveColorIndex ? 'active' : ''}`;
        selector.style.backgroundColor = guest.color;
        selector.setAttribute('data-color', guest.color);
        selector.title = guest.name;
        
        selector.addEventListener('click', () => selectColor(index));
        colorsContainer.appendChild(selector);
    });
}

function showAddGuestModal() {
    guestNameInput.value = '';
    guestModal.style.display = 'flex';
    guestNameInput.focus();
}

function hideAddGuestModal() {
    guestModal.style.display = 'none';
}

function addNewGuest() {
    const name = guestNameInput.value.trim();
    if (!name) return;
    
    if (guests.length >= availableColors.length) {
        showError('Максимальное количество участников: ' + availableColors.length);
        return;
    }
    
    const newGuest = {
        name: name,
        color: availableColors[guests.length],
        total: 0
    };
    
    guests.push(newGuest);
    updateColorPanel();
    updateSummary();
    hideAddGuestModal();
}

function updateSummary() {
    // Пересчитываем суммы для каждого участника
    guests.forEach(guest => guest.total = 0);
    
    if (receiptItems && receiptItems.length > 0) {
        receiptItems.forEach(item => {
            if (item.selectedBy.length > 0) {
                const splitAmount = item.price / item.selectedBy.length;
                item.selectedBy.forEach(guestIndex => {
                    if (guests[guestIndex]) {
                        guests[guestIndex].total += splitAmount;
                    }
                });
            }
        });
    }
    
    // Обновляем UI
    summaryList.innerHTML = '';
    let total = 0;
    
    guests.forEach((guest, index) => {
        if (guest.total > 0) {
            const summaryItem = document.createElement('div');
            summaryItem.className = 'summary-item';
            summaryItem.innerHTML = `
                <div class="guest-info">
                    <div class="guest-color" style="background-color: ${guest.color}"></div>
                    <span class="guest-name">${guest.name}</span>
                </div>
                <span class="guest-amount">${guest.total.toFixed(2)} ₽</span>
            `;
            summaryList.appendChild(summaryItem);
            total += guest.total;
        }
    });
    
    totalAmount.textContent = total.toFixed(2);
}

function updateReceiptsList() {
    if (uploadedReceipts.length === 0) {
        addReceiptBtn.style.display = 'none';
        return;
    }
    
    receiptsList.innerHTML = '';
    
    uploadedReceipts.forEach((receipt, index) => {
        const receiptItem = document.createElement('div');
        receiptItem.className = 'receipt-item';
        receiptItem.innerHTML = `
            <img src="${receipt.imageUrl}" alt="Чек">
            <div class="receipt-info">
                <h4>Чек ${index + 1}</h4>
                <p>Загружен: ${receipt.uploadTime}</p>
            </div>
        `;
        
        receiptItem.addEventListener('click', () => {
            // Здесь можно добавить функциональность просмотра конкретного чека
            console.log('Выбран чек:', receipt);
        });
        
        receiptsList.appendChild(receiptItem);
    });
    
    addReceiptBtn.style.display = 'block';
}

function showAnalysisScreen() {
    uploadScreen.style.display = 'none';
    analysisScreen.style.display = 'block';
}

function showUploadScreen() {
    analysisScreen.style.display = 'none';
    uploadScreen.style.display = 'block';
}

function showLoading(show) {
    loadingScreen.style.display = show ? 'flex' : 'none';
}

function showError(message) {
    if (tg.showAlert) {
        tg.showAlert(message);
    } else {
        alert(message);
    }
}

function shareResults() {
    if (!currentReceiptData || guests.every(g => g.total === 0)) {
        showError('Нет данных для отправки');
        return;
    }
    
    let message = '💳 Разделение счета:\n\n';
    
    guests.forEach(guest => {
        if (guest.total > 0) {
            message += `${guest.name}: ${guest.total.toFixed(2)} ₽\n`;
        }
    });
    
    const total = guests.reduce((sum, guest) => sum + guest.total, 0);
    message += `\n📊 Общая сумма: ${total.toFixed(2)} ₽`;
    
    if (tg.sendData) {
        tg.sendData(JSON.stringify({
            type: 'bill_split',
            message: message,
            guests: guests.filter(g => g.total > 0),
            total: total
        }));
    } else {
        // Fallback для тестирования
        navigator.clipboard?.writeText(message).then(() => {
            showError('Результат скопирован в буфер обмена');
        }).catch(() => {
            showError(message);
        });
    }
}

// Обработка событий Telegram WebApp
tg.onEvent('mainButtonClicked', shareResults);
tg.onEvent('backButtonClicked', () => {
    if (analysisScreen.style.display !== 'none') {
        showUploadScreen();
    }
});

// Настройка основной кнопки Telegram
function updateMainButton() {
    if (currentReceiptData && guests.some(g => g.total > 0)) {
        tg.MainButton.text = '📤 Поделиться результатом';
        tg.MainButton.show();
    } else {
        tg.MainButton.hide();
    }
}

// Обновляем кнопку при изменении данных
setInterval(updateMainButton, 1000);

// Функция для обработки ошибок в development режиме
window.addEventListener('error', (e) => {
    console.error('Глобальная ошибка:', e.error);
});

// Автосохранение данных в localStorage
function saveToLocalStorage() {
    try {
        const data = {
            guests: guests,
            uploadedReceipts: uploadedReceipts.map(r => ({
                ...r,
                file: null // Не сохраняем файлы
            }))
        };
        localStorage.setItem('billSplitterData', JSON.stringify(data));
    } catch (e) {
        console.warn('Не удалось сохранить данные:', e);
    }
}

function loadFromLocalStorage() {
    try {
        const saved = localStorage.getItem('billSplitterData');
        if (saved) {
            const data = JSON.parse(saved);
            if (data.guests) {
                guests = data.guests;
                updateColorPanel();
                updateSummary();
            }
        }
    } catch (e) {
        console.warn('Не удалось загрузить сохраненные данные:', e);
    }
}

// Загружаем сохраненные данные при инициализации
loadFromLocalStorage();

// Сохраняем данные при изменениях
setInterval(saveToLocalStorage, 5000);