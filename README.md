# NewRevibe - Next.js Admin & Customer Platform

A modern Next.js application with MongoDB integration, featuring separate admin and customer login portals.

## Features

- ✅ **Next.js 15** - Latest version with App Router
- ✅ **MongoDB & Mongoose** - Robust database with schemas
- ✅ **Separate Portals** - Admin and Customer authentication
- ✅ **Secure Authentication** - Password hashing with bcryptjs
- ✅ **TypeScript** - Full type safety
- ✅ **Tailwind CSS** - Modern, responsive UI
- ✅ **API Routes** - RESTful login endpoints

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
