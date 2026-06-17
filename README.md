# Auction App — Аукціонний застосунок з real-time ставками

Повноцінний аукціонний майданчик з WebSocket оновленнями в реальному часі.

## Стек

| Частина | Технології |
|---|---|
| Frontend | Next.js 16, TypeScript, Tailwind CSS v4, Socket.IO Client |
| Backend | NestJS, TypeScript, Socket.IO, @nestjs/schedule |
| База даних | PostgreSQL, Prisma ORM |
| Авторизація | JWT (access + refresh token), bcrypt |
| Файли | Cloudinary |

## Як запустити локально

### 1. Клонувати репозиторій

```bash
git clone https://github.com/your-username/auction-app.git
cd auction-app
```

### 2. Налаштувати бекенд

```bash
cd backend
npm install
```

Створити `.env`:

```env
NODE_ENV='development'
COOKIE_DOMAIN='localhost'
APP_URL="http://localhost:3000"
DATABASE_URL="postgresql://postgres:password@localhost:5432/auction_db?schema=public"
JWT_SECRET="your-secret-key"
JWT_ACCESS_TOKEN_EXPIRATION_TIME='2h'
JWT_REFRESH_TOKEN_EXPIRATION_TIME='7d'
CLOUDINARY_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
PORT=4000
```

Запустити міграції та сервер:

```bash
npx prisma migrate dev
npm run start:dev
```

### 3. Налаштувати фронтенд

```bash
cd frontend
npm install
```

Створити `.env`:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
```

Запустити:

```bash
npm run dev
```

### 4. Відкрити в браузері
http://localhost:3000

---

## API ендпоінти

### Auth

| Метод | URL | Auth | Опис |
|---|---|---|---|
| POST | `/auth/register` | — | Реєстрація |
| POST | `/auth/login` | — | Логін |
| GET | `/auth/me` | ✅ | Поточний користувач |
| POST | `/auth/refresh` | cookie | Оновити токен |
| POST | `/auth/logout` | — | Вийти |

### Lots

| Метод | URL | Auth | Опис |
|---|---|---|---|
| GET | `/lots/all` | — | Список активних лотів |
| GET | `/lots/:id` | — | Деталі лота + ставки |
| POST | `/lots` | ✅ | Створити лот |

### Bids

| Метод | URL | Auth | Опис |
|---|---|---|---|
| GET | `/lots/:id/bids/all` | — | Список ставок |
| POST | `/lots/:id/bids` | ✅ | Зробити ставку |

---

## WebSocket

**Підключення:** `http://localhost:4000/auction`

**Клієнт → Сервер:**

| Подія | Дані | Опис |
|---|---|---|
| `joinLot` | `lotId: string` | Підписатись на оновлення лота |
| `leaveLot` | `lotId: string` | Відписатись |

**Сервер → Клієнт:**

| Подія | Дані | Опис |
|---|---|---|
| `newBid` | `{ amount, createdAt, bidder }` | Нова ставка |
| `lotClosed` | `{ finalPrice, winner }` | Лот закрито |

---

## Схема бази даних

User        id, email, firstName, lastName, password

Lot         id, title, description, startPrice, currentPrice,

endTime, status, creatorId → User, winnerId → User

Bid         id, amount, createdAt, lotId → Lot, bidderId → User

LotLogo     id, url, lotId → Lot

---

## Бізнес-правила

- Ставка має перевищувати поточну найвищу ціну
- Ставку можна зробити тільки на активний лот
- Ставку можна зробити тільки до закінчення часу
- Cron-задача кожну хвилину закриває прострочені лоти
- Переможець — автор найвищої ставки