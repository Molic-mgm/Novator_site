# Deployment guide

Эта инструкция помогает избежать 404 при обращении к `/api/*` после загрузки сайта на хостинг.
Главное — запустить backend и направить на него все запросы к `/api` и `/uploads`.

## 1) Настройка backend (Node + MongoDB)
1. Скопируйте `backend/.env.example` в `backend/.env` и заполните:
   - `MONGO_URI` — строка подключения к MongoDB.
   - `JWT_SECRET` — любой надёжный секрет.
   - `FRONTEND_URL` и `ADMIN_URL` — домены, с которых будут идти запросы (для CORS).
2. Установите зависимости и запустите сервер (Node.js 18+):
   ```bash
   cd backend
   npm install
   npm run start
   ```
   По умолчанию сервер слушает порт `4000` и отдаёт API по `http://<host>:4000/api`.
3. Проверьте `/health` — должен вернуть `{ ok: true }`.

## 2) Настройка API-URL для фронтенда
Фронтенд строит базовый URL по переменной `VITE_API_URL` или из `public/runtime-config.js`.
Выберите один из вариантов:
- **Сборка с переменной:** перед `npm run build` в `frontend` задайте `VITE_API_URL=https://<ваш-домен-бэкенда>/api`.
- **Runtime-конфиг без пересборки:** откройте `frontend/public/runtime-config.js` и впишите полный адрес бэкенда в `apiUrl`.
  Файл кладётся рядом со статикой, его можно править прямо на хостинге.

## 3) Прокси-сервер (Nginx пример)
Проксируйте запросы `/api` и `/uploads` на порт backend, остальное — на статические файлы фронтенда:
```nginx
server {
    listen 80;
    server_name studiaorbita.ru www.studiaorbita.ru;

    # API и файлы загрузок
    location /api/ {
        proxy_pass http://127.0.0.1:4000/api/;
    }
    location /uploads/ {
        proxy_pass http://127.0.0.1:4000/uploads/;
    }

    # Статика фронтенда (собранная папка dist)
    root /var/www/studiaorbita/dist;
    try_files $uri /index.html;
}
```
Убедитесь, что порты совпадают с теми, что указаны в `.env` backend и в `VITE_API_URL`/`runtime-config.js`.

## 4) Частые проблемы
- **404 на /api/** — backend не запущен, порт недоступен или Nginx не проксирует `/api`.
- **CORS ошибки** — домены не перечислены в `FRONTEND_URL`/`ADMIN_URL` в `.env` backend.
- **Нет загрузок** — не проксируется `/uploads` из backend.
