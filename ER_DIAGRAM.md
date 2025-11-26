# ER Diagram - User Management System

## Database Schema

```
┌─────────────────────────────────────┐
│           USER                      │
├─────────────────────────────────────┤
│ _id (PK)                            │
│ name                                │
│ email (unique)                      │
│ phone (unique)                      │
│ password (hashed)                   │
│ profile_image                       │
│ address                             │
│ state                               │
│ city                                │
│ country                             │
│ pincode                             │
│ role (user/admin)                   │
│ refreshToken                        │
│ createdAt                           │
│ updatedAt                           │
└─────────────────────────────────────┘
```

## Architecture Overview

```
┌─────────────┐
│   React     │  Frontend (Port 3000)
│   Frontend  │
└──────┬──────┘
       │ HTTP/REST API
       │
┌──────▼──────┐
│   Express   │  Backend (Port 5000)
│   Server    │
└──────┬──────┘
       │
┌──────▼──────┐
│  MongoDB    │  Database
│  harveedesign│
└─────────────┘
```

## Component Flow

```
User Registration → Validation → Password Hash → MongoDB → JWT Tokens
User Login → Credentials Check → JWT Tokens → Protected Routes
Admin Dashboard → Token Verify → Admin Check → User List → CRUD Operations
```

