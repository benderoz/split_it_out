# 🔧 Исправление ошибки Jekyll

## Проблема
Ошибка возникает когда Jekyll пытается собрать сайт из папки `docs`, но она не существует:
```
Error: No such file or directory @ dir_chdir0 - /github/workspace/docs
```

## Причина
Автоматически запускается сборка GitHub Pages с Jekyll, хотя наш проект - это **Telegram Mini App**, а не Jekyll сайт.

## ✅ Решение

### 1. Отключить Jekyll (ГОТОВО)
Создан файл `.nojekyll` в корне проекта, который отключает Jekyll сборку.

### 2. Проверить настройки GitHub Pages
Если используете GitHub Pages:

1. Перейдите в **Settings** → **Pages**
2. Выберите **Source**: "Deploy from a branch"
3. Выберите **Branch**: "main" и **Folder**: "/ (root)"
4. **НЕ выбирайте** папку `/docs`

### 3. Альтернативное решение - настроить Jekyll
Если хотите использовать Jekyll для документации:

```bash
# Создать папку docs
mkdir docs

# Создать базовый Jekyll конфиг
cat > docs/_config.yml << EOF
title: "Telegram Bill Splitter"
description: "Mini App для разделения счетов"
baseurl: ""
url: ""
markdown: kramdown
highlighter: rouge
theme: minima
EOF

# Создать главную страницу
cat > docs/index.md << EOF
# Telegram Mini App для разделения счетов

Это приложение позволяет легко разделять счета между друзьями.

## Функции
- OCR распознавание чеков
- Интерактивное выделение позиций
- Автоматический подсчет сумм
- Интеграция с Telegram

[Открыть приложение](../public/index.html)
EOF
```

### 4. Для развертывания без Jekyll
Если не нужна документация:

```bash
# В корне проекта уже создан файл:
touch .nojekyll

# Добавить в .gitignore
echo "_site/" >> .gitignore
echo ".sass-cache/" >> .gitignore
echo ".jekyll-metadata" >> .gitignore
```

## 🚀 Запуск приложения

Jekyll НЕ влияет на работу Telegram Mini App. Приложение запускается через Node.js:

```bash
# Установка зависимостей
npm install

# Запуск сервера
node server.js

# Или через Docker
./deploy.sh
```

## 📱 URL приложения

- **Локально**: http://localhost:3000
- **Тестирование**: http://localhost:3000/test-upload.html
- **GitHub Pages** (если настроено): https://username.github.io/repository-name

## ✅ Проверка исправления

После создания `.nojekyll`:

1. ✅ Jekyll больше не должен запускаться
2. ✅ Ошибка "No such file or directory" исчезнет
3. ✅ Telegram Mini App работает как обычно

## 🔍 Дополнительная диагностика

Если ошибка остается:

```bash
# Проверить статус сервера
./full-test.sh

# Запустить диагностику
node server.js

# Проверить порт
curl http://localhost:3000/api/health
```

---

**Файл `.nojekyll` уже создан и должен решить проблему с Jekyll!** ✅