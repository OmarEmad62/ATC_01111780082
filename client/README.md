# Frontend – Event Booking System

This is the frontend of the Event Booking System built with **React**, **Vite**, and **Tailwind CSS**.

## 🚀 Features

- User Authentication
- Event listing and filtering
- Booking functionality
- Admin interface for managing events
- Responsive UI

## 🔧 Technologies

- Vite + React
- Tailwind CSS for UI components
- React Router for navigation
- Axios for API communication

## 🏗️ Project Structure

```
client/
│
├── public/
│   └── index.html
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── contexts/
│   ├── hooks/
│   ├── App.tsx
│   └── main.tsx
├── tailwind.config.js
├── package.json
└── .env
```

## ⚙️ Setup Instructions

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

## 🌍 Environment Variable

```env
VITE_API_URL=http://localhost:5000/api
```
