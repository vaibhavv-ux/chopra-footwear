# Chopra Industries — Premium Footwear E-Commerce

A full-stack e-commerce web application for a footwear store built with React, Node.js, Express, and MySQL.

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18, Vite, Tailwind CSS        |
| Backend   | Node.js, Express.js                 |
| Database  | MySQL                               |
| Auth      | JWT (httpOnly cookies) + bcryptjs    |
| Charts    | Recharts                            |
| Uploads   | Multer (local storage)              |
| Security  | Helmet, express-rate-limit, express-validator |

## Prerequisites

- **Node.js** v18+ and npm
- **MySQL** 8.0+

## Setup Instructions

### 1. Clone / Open the project

```bash
cd chopra-industries
```

### 2. Set up the Database

1. Open MySQL client (MySQL Workbench, terminal, phpMyAdmin, etc.)
2. Run the SQL schema + seed file:

```bash
mysql -u root -p < server/schema.sql
```

Or paste the contents of `server/schema.sql` into your MySQL client and execute.

### 3. Configure Environment

**Server** (`server/.env`):
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=chopra_industries
JWT_SECRET=chopra_super_secret_jwt_key_2024
CLIENT_URL=http://localhost:5173
```

**Client** (`client/.env`):
```env
VITE_API_URL=http://localhost:5000
```

### 4. Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 5. Start the Application

Open two terminal windows:

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
```

The app will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Default Accounts

| Role  | Email              | Password   |
|-------|--------------------|------------|
| Admin | admin@chopra.com   | Admin@123  |

## Features

### Customer Features
- 🛍️ Browse products with category, price, and size filters
- 🔍 Full-text search across products
- 📱 Fully responsive design (320px to 1440px)
- 🛒 Persistent shopping cart (localStorage for guests, DB for logged-in)
- 💳 Checkout with address form and COD/Online payment
- 📦 Order tracking with visual timeline
- ❤️ Wishlist
- ⭐ Product reviews and ratings
- 🏷️ Coupon code system
- 📷 Product image gallery
- 🕐 Recently viewed products

### Admin Features
- 📊 Dashboard with revenue charts and stats
- 📦 Product management (CRUD with image upload)
- 📋 Order management with status updates
- 👥 User management with role control
- 🗂️ Category management
- 🏷️ Coupon management
- 📈 Inventory stock levels

### Security
- JWT stored in httpOnly cookies (7-day expiry)
- bcryptjs password hashing (12 salt rounds)
- Input validation with express-validator
- Helmet.js for HTTP security headers
- Rate limiting on auth routes
- SQL parameterized queries (no raw concatenation)
- CORS configured for frontend origin

## Project Structure

```
chopra-industries/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── context/        # Auth & Cart contexts
│   │   ├── pages/          # Page components
│   │   │   └── admin/      # Admin panel pages
│   │   └── utils/          # API client & helpers
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/                 # Express backend
│   ├── config/             # DB & Multer config
│   ├── controllers/        # Route handlers
│   ├── middleware/          # Auth & validation
│   ├── routes/             # API routes
│   ├── uploads/            # Uploaded images
│   ├── schema.sql          # Database schema + seed
│   └── index.js            # Server entry point
└── README.md
```

## API Endpoints

### Auth
- `POST /api/auth/register` — Register user
- `POST /api/auth/login` — Login
- `POST /api/auth/logout` — Logout
- `GET /api/auth/me` — Get current user

### Products
- `GET /api/products` — List with filters (category, search, sort, price, size, page)
- `GET /api/products/:id` — Product detail
- `POST /api/products` — Create (admin)
- `PUT /api/products/:id` — Update (admin)
- `DELETE /api/products/:id` — Delete (admin)

### Cart, Orders, Wishlist, Reviews, Coupons, Categories
See `server/routes/` for full API documentation.

## Seed Data

- 3 Categories: Sneakers, Formal, Sports
- 14 Products with images from picsum.photos
- 3 Coupon codes: WELCOME10, FLAT500, CHOPRA20
- 1 Admin account

---

Built with ❤️ for Chopra Industries
