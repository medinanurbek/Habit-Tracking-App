# 📋 Habit Tracker - Backend API

Habit tracking application backend with JWT authentication, user management, and security features.

## 👥 Team Member: Backend Auth + Users + Security

**Responsibility:** Authentication, user management, JWT middleware, and global error handling.

---

## 🚀 Features

- ✅ User registration with password hashing (bcrypt)
- ✅ User login with JWT authentication
- ✅ Protected routes with JWT middleware
- ✅ User profile management
- ✅ Input validation with Joi
- ✅ Global error handling
- ✅ MongoDB Atlas integration
- ✅ Role-based structure (ready for RBAC)

---

## 📁 Project Structure

```
habit-tracker/
├── src/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── models/
│   │   └── User.js               # User model with bcrypt
│   ├── controllers/
│   │   ├── authController.js     # Register & Login logic
│   │   └── userController.js     # Profile management
│   ├── routes/
│   │   ├── authRoutes.js         # Auth endpoints
│   │   └── userRoutes.js         # User endpoints
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT verification
│   │   └── errorMiddleware.js    # Global error handler
│   ├── utils/
│   │   └── validators.js         # Joi validation schemas
│   ├── app.js                    # Express app setup
│   └── server.js                 # Server entry point
├── .env                          # Environment variables
├── .gitignore
├── package.json
└── README.md
```

---

## 🛠️ Installation & Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd habit-tracker
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env` file in the root directory:

```env
# MongoDB Connection
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/habittracker?retryWrites=true&w=majority

# JWT Secret (generate a random string)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Server Port
PORT=5000

# Node Environment
NODE_ENV=development
```

**⚠️ Important:** 
- Replace `MONGO_URI` with your actual MongoDB Atlas connection string
- Generate a strong random string for `JWT_SECRET`
- Never commit `.env` to Git!

### 4. Run the server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server will run on `http://localhost:5000`

---

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

---

### 🔓 Public Endpoints (No Authentication Required)

#### 1. Test API
```http
GET /
```

**Response:**
```json
{
  "success": true,
  "message": "Habit Tracker API is running 🚀",
  "version": "1.0.0"
}
```

---

#### 2. Register User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "user",
      "createdAt": "2024-02-09T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Validation Rules:**
- `username`: 3-30 characters, required
- `email`: valid email format, required
- `password`: minimum 6 characters, required

---

#### 3. Login User
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 🔒 Private Endpoints (Authentication Required)

**All private endpoints require a JWT token in the Authorization header:**
```
Authorization: Bearer <your_jwt_token>
```

---

#### 4. Get User Profile
```http
GET /api/users/profile
```

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "user",
      "avatar": "",
      "bio": "",
      "createdAt": "2024-02-09T10:30:00.000Z",
      "updatedAt": "2024-02-09T10:30:00.000Z"
    }
  }
}
```

---

#### 5. Update User Profile
```http
PUT /api/users/profile
```

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body (all fields optional):**
```json
{
  "username": "johndoe_updated",
  "email": "newemail@example.com",
  "bio": "I love tracking my habits!",
  "avatar": "https://example.com/avatar.jpg"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "johndoe_updated",
      "email": "newemail@example.com",
      "role": "user",
      "avatar": "https://example.com/avatar.jpg",
      "bio": "I love tracking my habits!",
      "updatedAt": "2024-02-09T11:00:00.000Z"
    }
  }
}
```

---

## 🔐 Security Features

### 1. Password Hashing (bcrypt)
- Passwords are hashed using bcrypt with a salt factor of 10
- Located in: `src/models/User.js` (pre-save middleware)
- Automatic hashing before saving to database

### 2. JWT Authentication
- Token generation: `authController.js` → `generateToken()`
- Token verification: `authMiddleware.js` → `authMiddleware()`
- Tokens expire after 7 days
- Format: `Bearer <token>`

### 3. Input Validation (Joi)
- Registration validation: username, email, password
- Login validation: email, password
- Profile update validation: optional fields
- Located in: `src/utils/validators.js`

### 4. Global Error Handling
- Centralized error responses
- Handles MongoDB errors (validation, duplicate keys, CastError)
- Returns consistent JSON format
- Located in: `src/middleware/errorMiddleware.js`

---

## ⚠️ Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description"
}
```

### Common Error Codes:
- `400` - Bad Request (validation errors, duplicate data)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (user/resource not found)
- `500` - Internal Server Error

### Examples:

**Missing Token:**
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

**Invalid Token:**
```json
{
  "success": false,
  "message": "Invalid token."
}
```

**Validation Error:**
```json
{
  "success": false,
  "message": "Email is required"
}
```

**Duplicate Email:**
```json
{
  "success": false,
  "message": "Email already exists"
}
```

---

## 🧪 Testing with Postman/Thunder Client

### 1. Register a new user
- Method: `POST`
- URL: `http://localhost:5000/api/auth/register`
- Body (JSON):
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "test123"
}
```

### 2. Login
- Method: `POST`
- URL: `http://localhost:5000/api/auth/login`
- Body (JSON):
```json
{
  "email": "test@example.com",
  "password": "test123"
}
```
- **Copy the token from the response!**

### 3. Get Profile (Protected)
- Method: `GET`
- URL: `http://localhost:5000/api/users/profile`
- Headers:
  - Key: `Authorization`
  - Value: `Bearer <paste_token_here>`

### 4. Update Profile (Protected)
- Method: `PUT`
- URL: `http://localhost:5000/api/users/profile`
- Headers:
  - Key: `Authorization`
  - Value: `Bearer <paste_token_here>`
- Body (JSON):
```json
{
  "username": "updateduser",
  "bio": "I love habits!"
}
```

---

## 🎯 What to Show During Defence

### 1. JWT Authentication Flow
**Explain:**
- Token generation in `authController.js` (line ~8-14)
- Token verification in `authMiddleware.js` (line ~24-26)
- How `req.user` is populated (line ~36-41)

**Demo:**
- Show login response with token
- Show protected route working with token
- Show error when token is missing/invalid

---

### 2. Password Hashing with bcrypt
**Explain:**
- Pre-save middleware in `User.js` (line ~51-64)
- Salt generation and hashing process
- Password comparison method (line ~67-69)

**Demo:**
- Register a user
- Show hashed password in MongoDB Atlas
- Show successful login with original password

---

### 3. Global Error Handling
**Explain:**
- Error middleware in `errorMiddleware.js`
- Different error types (Validation, Duplicate, CastError)
- Consistent error response format

**Demo:**
- Try registering with existing email → 400 error
- Try accessing protected route without token → 401 error
- Try invalid validation → 400 error

---

### 4. Input Validation (Joi)
**Explain:**
- Validation schemas in `validators.js`
- How validation runs before controller logic
- Custom error messages

**Demo:**
- Try registering with short password
- Try registering with invalid email
- Show validation error messages

---

## 🔧 Technologies Used

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB Atlas
- **ODM:** Mongoose
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcryptjs
- **Validation:** Joi
- **Environment Variables:** dotenv
- **CORS:** cors

---

## 📦 Dependencies

```json
{
  "express": "^4.18.2",
  "mongoose": "^8.0.3",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.2",
  "joi": "^17.11.0",
  "dotenv": "^16.3.1",
  "cors": "^2.8.5"
}
```

---

## 🚀 Deployment Considerations

1. **Environment Variables:** Set all variables in hosting platform
2. **MongoDB Atlas:** Whitelist deployment server IP
3. **JWT_SECRET:** Use strong random string in production
4. **CORS:** Update `CLIENT_URL` with actual frontend domain
5. **NODE_ENV:** Set to `production`

---

## 🤝 Integration Points for Team Members

### For Habit CRUD Developer:
```javascript
// src/routes/habitRoutes.js
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/habits', authMiddleware, createHabit);
router.get('/habits', authMiddleware, getHabits);
// Access user: req.user.id
```

### For Advanced Features Developer:
```javascript
// Role-based access example
const { roleMiddleware } = require('../middleware/authMiddleware');

router.delete('/admin/users/:id', authMiddleware, roleMiddleware('admin'), deleteUser);
```

---

## 📞 Support

If you encounter any issues:
1. Check `.env` file configuration
2. Verify MongoDB Atlas connection string
3. Ensure all dependencies are installed
4. Check server logs for error messages

---

## 📝 License

This project is created for educational purposes.

---

**Created by:** [Your Name]  
**Date:** February 2024  
**Course:** Web Development Final Project
