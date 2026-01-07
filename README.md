
# Revibe - Next.js & NestJS Fullstack Platform

A modern, modular full-stack application with:
- **Next.js 15** (React 19, SSR, App Router)
- **NestJS-style API** (modular, feature-based)
- **MongoDB/Mongoose** for data
- **Tailwind CSS** for UI
- **Socket.io** for real-time features
- **Swagger** for API docs
- **Cloudinary** for media
- **Zod** for validation, **Zustand** for state, **Sonner** for notifications

## Overview
This project powers a social platform with:
- Admin dashboard (manage users, products, orders, settings)
- Customer portal (login, onboarding, feed)
- Social features: like, comment, follow, share, save, poll, quiz, reels
- Livestreaming (start, end, chat, like, view)
- Modular API (admin/customer separation, feature folders)
- Swagger UI at `/api-docs`

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
├── public/                         # Static assets
├── src/
│   ├── app/
│   │   ├── globals.css             # Global styles
│   │   ├── layout.tsx, page.tsx    # Root layout & landing
│   │   ├── admin/                  # Admin dashboard UI
│   │   │   ├── dashboard/          # Admin dashboard pages
│   │   │   ├── orders/, products/, users/, settings/ # CRUD UIs
│   │   │   ├── Feed/, livestream/, login/            # Social & live features
│   │   │   ├── Assest/, components/                  # UI components
│   │   │   └── storeAPICall/                        # API store logic (Zustand)
│   │   ├── api/                    # Modular API (admin/customer)
│   │   │   ├── admin/              # Admin APIs (feed, login, user, ...)
│   │   │   ├── customer/           # Customer APIs (auth, post, ...)
│   │   │   └── swagger/            # Swagger docs route
│   │   ├── api-docs/               # Swagger UI & custom styles
│   │   ├── customer/               # Customer login & onboarding
│   │   └── socket/                 # Socket.io integration
│   ├── common/                     # Shared logic (aggregation, stats)
│   ├── lib/                        # Utility libraries (auth, db, cloudinary, jwt, mux, ...)
│   └── models/                     # Mongoose models (User, Post, Comment, Vote, ...)
└── README.md                       # Project documentation
```

---

## Key Features
- **Admin Dashboard**: Manage users, products, orders, settings
- **Customer Portal**: Login, onboarding, Aadhar verification
- **Social Feed**: Like, comment, follow, share, save, poll, quiz, reels
- **Livestreaming**: Start/end, chat, like, view
- **API Documentation**: Swagger UI at `/api-docs`
- **Socket.io**: Real-time notifications & chat
- **Cloudinary**: Media upload/delete
- **Modular Structure**: Feature-based folders for scalability
- **Zod, Zustand, Sonner**: Modern state, validation, notifications

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
- **src/app/admin/**: Admin dashboard UI, CRUD, social, livestream, components, Zustand store
- **src/app/api/**: Modular API endpoints (admin/customer, feature-based)
- **src/app/api-docs/**: Swagger UI and custom styles
- **src/app/customer/**: Customer login, onboarding
- **src/app/socket/**: Real-time socket logic
- **src/common/**: Shared logic (aggregation, stats, helpers)
- **src/lib/**: Utility libraries (auth, db, cloudinary, jwt, mux, ...)
- **src/models/**: Mongoose models (User, Post, Comment, Vote, ...)

---

---


## API Endpoints
- All API routes are under `/api/`
- Modular: `/api/admin/*` and `/api/customer/*`
- See Swagger docs at `/api-docs` for full API reference

---

---


## Technologies Used
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Modular API (NestJS-style), Swagger, Zod
- **Database**: MongoDB (Mongoose ODM)
- **Real-time**: Socket.io
- **Media**: Cloudinary
- **State/Validation**: Zustand, Zod, Sonner

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

Open [http://localhost:3000](http://localhost:3000) in your browser.


---

## Available Routes (Examples)

- `/` - Home page with portal selection
- `/admin/login` - Admin login page
- `/admin/dashboard` - Admin dashboard (protected)
- `/customer/login` - Customer login page
- `/api/admin/login` - Admin login API endpoint
- `/api/customer/login` - Customer login API endpoint
- `/api/customer/post/list` - Customer feed API (cursor-based pagination)
- `/api/admin/feed` - Admin feed API (with filters, metrics)

---

## Development Notes
- Passwords are hashed using bcryptjs (salt round 10)
- MongoDB connection uses pooling
- JWT tokens recommended for production
- All API routes include error handling and validation

---

## Future Enhancements
- [ ] JWT-based authentication
- [ ] Password reset functionality
- [ ] Customer dashboard
- [ ] Admin user management
- [ ] Protected API routes with middleware
- [ ] Session management with cookies

---

## License

MIT
