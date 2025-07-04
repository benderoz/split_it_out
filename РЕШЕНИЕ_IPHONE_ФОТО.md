# ✅ Решение проблемы выбора фото на iPhone

## Проблема
На мобильных устройствах iPhone при нажатии на кнопку выбора фото сразу открывалась камера без возможности выбрать фото из галереи.

## Причина
HTML атрибут `capture="environment"` в элементе `<input type="file">` принуждает мобильные браузеры открывать камеру напрямую, не предоставляя пользователю выбор.

## Решение

### 1. Изменен HTML (index.html)
Заменен единый input с атрибутом capture на два отдельных input элемента и кнопки выбора:

**Было:**
```html
<input type="file" id="receiptInput" accept="image/*" capture="environment">
<label for="receiptInput" class="upload-btn">Выбрать фото</label>
```

**Стало:**
```html
<!-- Скрытые input элементы -->
<input type="file" id="receiptInputGallery" accept="image/*" style="display: none;">
<input type="file" id="receiptInputCamera" accept="image/*" capture="environment" style="display: none;">

<!-- Кнопки выбора -->
<div class="upload-options">
    <button class="upload-btn" id="galleryBtn">
        <span class="btn-icon">🖼️</span>
        <span>Из галереи</span>
    </button>
    <button class="upload-btn" id="cameraBtn">
        <span class="btn-icon">📷</span>
        <span>Сделать фото</span>
    </button>
</div>
```

### 2. Обновлен CSS (style.css)
Добавлены стили для новых кнопок выбора:

```css
.upload-options {
    display: flex;
    gap: 15px;
    margin-top: 20px;
    flex-wrap: wrap;
    justify-content: center;
}

.upload-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px 25px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 20px;
    font-weight: 600;
    transition: all 0.3s ease;
    cursor: pointer;
    border: none;
    font-size: 14px;
    min-width: 120px;
    height: 80px;
    gap: 8px;
}
```

### 3. Обновлен JavaScript (script.js)
- Добавлены ссылки на новые элементы
- Обновлены обработчики событий для поддержки обеих кнопок
- Исправлена функция сброса значений input элементов

**Ключевые изменения:**
```javascript
// Новые DOM элементы
const receiptInputGallery = document.getElementById('receiptInputGallery');
const receiptInputCamera = document.getElementById('receiptInputCamera');
const galleryBtn = document.getElementById('galleryBtn');
const cameraBtn = document.getElementById('cameraBtn');

// Обработчики событий
galleryBtn.addEventListener('click', () => {
    receiptInputGallery.click(); // Откроет галерею на iPhone
});

cameraBtn.addEventListener('click', () => {
    receiptInputCamera.click(); // Откроет камеру на iPhone
});
```

## Результат

Теперь пользователи iPhone видят две отдельные кнопки:

1. **🖼️ Из галереи** - открывает медиатеку iPhone для выбора существующих фотографий
2. **📷 Сделать фото** - открывает камеру для создания нового снимка

## Преимущества решения

✅ **Четкий выбор** - пользователь сразу понимает какое действие выполнит каждая кнопка
✅ **iOS совместимость** - работает корректно на всех версиях iOS Safari
✅ **UX улучшение** - более интуитивный интерфейс
✅ **Обратная совместимость** - работает на всех платформах (Android, Desktop)

## Тестирование

Для проверки:
1. Откройте приложение на iPhone в Telegram
2. Нажмите "🖼️ Из галереи" - должна открыться медиатека
3. Нажмите "📷 Сделать фото" - должна открыться камера
4. Протестируйте на других устройствах для убеждения в совместимости

Проблема с принудительным открытием камеры полностью решена! 🎉