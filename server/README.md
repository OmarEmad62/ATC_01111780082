# Backend – Event Booking System

This is the backend of the Event Booking System built with **Node.js**, **Express**, and **MongoDB**.

## 🚀 Features

- User registration and login (JWT-based)
- CRUD operations for events
- Booking system
- Cloudinary image upload support
- Admin controls

## 🔧 Technologies Used

- Node.js, Express
- MongoDB with Mongoose
- JWT Authentication
- Cloudinary for image storage
- dotenv for environment variables

## 🏗️ Project Structure

```
server/
├── middlewares/       # Authentication and error handling
├── models/            # Mongoose schemas
├── routes/            # Express routes
├── server.js          # App entry point
└── .env
```

## ⚙️ Setup Instructions

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

## 🌍 Environment Variables

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/database
JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```
