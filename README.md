# NewRevibe - Next.js Admin & Customer Platform

A modern Next.js application with MongoDB integration, featuring separate admin and customer login portals.

## Features


# Revibe NestJS & Next.js Project

## Overview
This project is a full-stack application built with Next.js (frontend) and NestJS (backend API). It features an admin dashboard, customer authentication, social features (like, follow, comment), livestreaming, and more. The backend is organized as an API-first architecture, while the frontend uses modern React and Tailwind CSS.

---

## Project Structure

```
.
├── create-admin.bat                # Script to create admin user
├── next-env.d.ts                   # Next.js TypeScript environment
├── next.config.ts                  # Next.js configuration
├── package.json                    # Project dependencies and scripts
├── postcss.config.mjs              # PostCSS config for Tailwind
├── tailwind.config.ts              # Tailwind CSS config
├── tsconfig.json                   # TypeScript config
├── scripts/                        # Utility scripts (hash passwords, seed DB)
├── src/
│   ├── app/                        # Next.js app directory
│   │   ├── globals.css             # Global styles
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Main landing page
│   │   ├── admin/                  # Admin dashboard (UI)
│   │   ├── api/                    # API routes (NestJS)
│   │   ├── api-docs/               # Swagger UI for API docs
│   │   ├── customer/               # Customer login UI
│   │   └── socket/                 # Socket.io integration
│   ├── components/                 # Shared React components
│   ├── lib/                        # Utility libraries (auth, db, cloudinary, etc.)
│   └── models/                     # Mongoose models (User, Post, Comment, etc.)
└── README.md                       # Project documentation
```

---

## Key Features
- **Admin Dashboard**: Manage users, products, orders, and settings
- **Customer Authentication**: Login, Aadhar verification, profile completion
- **Social Features**: Like, comment, follow, share, save posts
- **Livestreaming**: Start, end, chat, like, view livestreams
- **API Documentation**: Swagger UI at `/api-docs`
- **Socket.io**: Real-time features
- **Cloudinary Integration**: Media upload and delete
- **Modular Structure**: Organized by feature for scalability

---

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB instance

### Installation
1. Clone the repository:
  ```sh
  git clone <repo-url>
  cd Revibe_Nestjs_Project
  ```
2. Install dependencies:
  ```sh
  npm install
  ```
3. Configure environment variables:
  - Create a `.env` file in the root directory (see `.env.example` if available)
4. (Optional) Seed the database:
  ```sh
  node scripts/seedDatabase.js
  ```
5. Start the development server:
  ```sh
  npm run dev
  ```

---

## Scripts
- `npm run dev` — Start Next.js in development mode
- `npm run build` — Build for production
- `npm run start` — Start production server
- `node scripts/hashPassword.js` — Hash a password (utility)
- `node scripts/seedDatabase.js` — Seed the database

---

## Folder Details
- **src/app/admin/**: Admin dashboard UI and routes
- **src/app/api/**: All backend API endpoints (NestJS style)
- **src/app/api-docs/**: Swagger UI and custom styles
- **src/app/customer/**: Customer login and onboarding
- **src/app/socket/**: Real-time socket logic
- **src/components/**: Shared React components
- **src/lib/**: Utility libraries (auth, db, cloudinary, etc.)
- **src/models/**: Mongoose models for all entities

---

## API Endpoints
- All API routes are under `/api/`
- See Swagger docs at `/api-docs` for full API reference

---

## Technologies Used
- **Next.js** (React, SSR, API routes)
- **NestJS** (API structure)
- **MongoDB** (Mongoose ODM)
- **Tailwind CSS** (UI styling)
- **Socket.io** (Real-time communication)
- **Cloudinary** (Media management)

---

## Contributing
1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## License
[MIT](LICENSE)

---

## Contact
For questions or support, please open an issue or contact the maintainer.

## Project Structure

```
newRevibe/
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   ├── login/          # Admin login page
│   │   │   └── dashboard/      # Admin dashboard
│   │   ├── customer/
│   │   │   └── login/          # Customer login page
│   │   └── api/
│   │       ├── admin/
│   │       │   └── login/      # Admin login API
│   │       └── customer/
│   │           └── login/      # Customer login API
│   ├── lib/
│   │   └── db.ts              # MongoDB connection
│   └── models/
│       ├── Admin.ts           # Admin schema
│       └── Customer.ts        # Customer schema
├── scripts/
│   └── hashPassword.js        # Password hashing utility
└── .env.local                 # Environment variables
```

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup MongoDB

Update `.env.local` with your MongoDB connection string:

```env
MONGODB_URI=mongodb://localhost:27017/newrevibe
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/newrevibe
```

### 3. Create Admin/Customer Users

Use the password hashing script to generate hashed passwords:

```bash
node scripts/hashPassword.js your_password
```

Then insert the admin and customer documents into MongoDB:

**Admin Collection:**
```json
{
  "email": "admin@example.com",
  "password": "hashed_password_here",
  "name": "Admin User",
  "role": "admin"
}
```

**Customer Collection:**
```json
{
  "email": "customer@example.com",
  "password": "hashed_password_here",
  "name": "Customer User",
  "phone": "1234567890",
  "address": "123 Main St"
}
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Routes

- `/` - Home page with portal selection
- `/admin/login` - Admin login page
- `/admin/dashboard` - Admin dashboard (protected)
- `/customer/login` - Customer login page
- `/api/admin/login` - Admin login API endpoint
- `/api/customer/login` - Customer login API endpoint

## API Endpoints

### Admin Login
**POST** `/api/admin/login`

Request Body:
```json
{
  "email": "admin@example.com",
  "password": "your_password"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": "...",
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "admin"
  }
}
```

### Customer Login
**POST** `/api/customer/login`

Request Body:
```json
{
  "email": "customer@example.com",
  "password": "your_password"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": "...",
    "email": "customer@example.com",
    "name": "Customer User",
    "phone": "1234567890",
    "address": "123 Main St"
  }
}
```

## Technologies Used

- **Frontend**: React 19, Next.js 15, TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB with Mongoose
- **Authentication**: bcryptjs
- **Form Handling**: React Hooks

## Development Notes

- Passwords are hashed using bcryptjs with a salt round of 10
- MongoDB connection uses connection pooling to optimize performance
- Admin sessions are stored in localStorage (consider JWT tokens for production)
- All API routes include error handling and validation

## Future Enhancements

- [ ] JWT-based authentication
- [ ] Password reset functionality
- [ ] Customer dashboard
- [ ] Admin user management
- [ ] Protected API routes with middleware
- [ ] Session management with cookies

## License

MIT
