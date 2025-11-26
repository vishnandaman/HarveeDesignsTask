# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication Endpoints

### Register User
- **POST** `/api/auth/register`
- **Body:** multipart/form-data
- **Fields:** name, email, phone, password, state, city, country, pincode, address (optional), profile_image (optional)
- **Response:** User object and tokens

### Login
- **POST** `/api/auth/login`
- **Body:** JSON
- **Fields:** emailOrPhone, password
- **Response:** User object and tokens

### Refresh Token
- **POST** `/api/auth/refresh`
- **Body:** JSON
- **Fields:** refreshToken
- **Response:** New accessToken

## User Endpoints

### Get All Users (Admin Only)
- **GET** `/api/users?page=1&limit=10&search=&state=&city=&sortBy=createdAt&sortOrder=desc`
- **Headers:** Authorization: Bearer <token>
- **Response:** Array of users with pagination info

### Get User by ID
- **GET** `/api/users/:id`
- **Headers:** Authorization: Bearer <token>
- **Response:** User object

### Update User
- **PUT** `/api/users/:id`
- **Headers:** Authorization: Bearer <token>
- **Body:** multipart/form-data (all fields optional)
- **Response:** Updated user object

### Delete User (Admin Only)
- **DELETE** `/api/users/:id`
- **Headers:** Authorization: Bearer <token>
- **Response:** Success message

## Postman Collection

Import the collection from: `postman_collection.json`

Or use this base URL: `http://localhost:5000/api`

## Example Requests

**Login:**
```json
POST /api/auth/login
{
  "emailOrPhone": "user@example.com",
  "password": "password123"
}
```

**Get Users:**
```
GET /api/users?page=1&limit=10
Authorization: Bearer <your_token>
```

