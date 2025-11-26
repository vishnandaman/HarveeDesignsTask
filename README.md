# User Management System

A full-stack User Management System built with MERN stack (MongoDB, Express.js, React.js, Node.js) featuring JWT authentication, CRUD operations, and an admin dashboard.

## Features

- User Registration & Login with JWT Authentication
- Access Token (1 hour) & Refresh Token (7 days)
- Complete CRUD Operations for Users
- Admin Dashboard with Search, Filter, and Pagination
- Image Upload Support (Profile Images)
- Input Validation (Frontend & Backend)
- Role-Based Access Control (Admin/User)
- Secure Password Hashing (bcrypt)
- RESTful API Design
- Responsive UI

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher) - Make sure MongoDB is running
- npm or yarn

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd user-management-system
```

### 2. Backend Setup

```bash
cd backend
npm install

copy env.example .env

PORT=5000
MONGODB_URI=mongodb://localhost:27017/harveedesign
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_REFRESH_SECRET=your_super_secret_refresh_token_key_change_in_production
JWT_ACCESS_EXPIRY=1h
JWT_REFRESH_EXPIRY=7d
NODE_ENV=development

npm run dev
```

The backend server will run on `http://localhost:5000`

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install

REACT_APP_API_URL=http://localhost:5000/api

npm start
```

The frontend will run on `http://localhost:3000`

## Project Structure

```
user-management-system/
├── backend/
│   ├── models/
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── users.js
│   ├── middleware/
│   │   └── auth.js
│   ├── utils/
│   │   ├── jwt.js
│   │   └── upload.js
│   ├── uploads/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
└── README.md
```

## API Endpoints

### Authentication

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| POST | `/api/auth/refresh` | Refresh access token | Public |

### Users

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/users` | Get all users (with pagination, search, filter) | Admin |
| GET | `/api/users/:id` | Get user by ID | Private |
| PUT | `/api/users/:id` | Update user | Private |
| DELETE | `/api/users/:id` | Delete user | Admin |

### Request Headers

For protected routes, include:
```
Authorization: Bearer <access_token>
```

## Security Features

1. Password Hashing: Using bcrypt with salt rounds
2. JWT Tokens: Secure token-based authentication
3. Input Validation: Both frontend and backend validation
4. CORS: Configured for frontend origin
5. Helmet: Security headers middleware
6. Rate Limiting: Protection against brute force attacks
7. Token Refresh: Automatic token refresh mechanism

## Admin Dashboard Features

- View all users in a table format
- Search by name or email
- Filter by state and city
- Sort by any column (name, email, state, city, createdAt)
- Pagination support
- View detailed user information
- Edit user details
- Delete users
- Profile image display

## Testing

### Using Postman

1. Import the Postman collection (if provided)
2. Set environment variables:
   - `base_url`: `http://localhost:5000/api`
   - `access_token`: (will be set after login)

### Manual Testing Steps

1. Register a new user
2. Login with credentials
3. Copy the access token
4. Use token in Authorization header for protected routes
5. Test CRUD operations

## Database Schema

### User Model

```javascript
{
  _id: ObjectId,
  name: String (min 3, alphabets only),
  email: String (unique, valid email),
  phone: String (10-15 digits),
  password: String (hashed),
  profile_image: String (url/path),
  address: String (max 150 chars, optional),
  state: String (required),
  city: String (required),
  country: String (required),
  pincode: String (4-10 digits),
  role: String (enum: 'user', 'admin', default: 'user'),
  refreshToken: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Common Issues & Solutions

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod` or start MongoDB service
- Check MONGODB_URI in .env file

### Port Already in Use
- Change PORT in backend/.env
- Or kill the process using the port

### CORS Error
- Ensure backend CORS is configured for frontend URL
- Check FRONTEND_URL in backend/.env

### Image Upload Fails
- Ensure `uploads/` directory exists in backend
- Check file size (max 2MB) and format (JPG/PNG)

## Technologies Used

### Backend
- Node.js
- Express.js
- MongoDB & Mongoose
- JWT (jsonwebtoken)
- bcryptjs
- Multer (file upload)
- express-validator
- Helmet (security)
- express-rate-limit

### Frontend
- React.js
- React Router DOM
- Axios
- React Toastify

## Default Admin User

To create an admin user:

1. Register normally through the app
2. Update the user role in MongoDB:
```javascript
use harveedesign
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

Or use the script:
```bash
cd backend
node scripts/createAdmin.js admin@example.com
```

## License

This project is created for internship assignment purposes.

## Author

Created for Harvee Designs Assignment
