# 🌱 DeshiMart - Direct Farmers Marketplace & AI Agronomist

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

**DeshiMart** is a full-stack agricultural e-commerce and advisory platform that directly connects local farmers with consumers. Farmers can list their organic crops, vegetables, seeds, fertilizers, and farming equipment, while consumers can easily browse, purchase, and pay via UPI or Razorpay. The platform also includes an intelligent AI Farming Assistant for 24/7 crop advice, disease management, and market guidance.

---

## ✨ Features

- **👨‍🌾 Farmer Dashboard**: Direct listing of harvests, seeds, tools, and fertilizers with stock management and preset crop photos.
- **🛒 Consumer Marketplace**: Category filtering (Crops, Seeds, Fertilizers, Tools), instant search, and real-time inventory counts.
- **💳 Multi-Mode Payment Gateway**:
  - **Razorpay Integration**: Native checkout modal with Cards, Netbanking, and UPI.
  - **Dynamic UPI QR Code**: Live QR with merchant details (`SUBARNO MALLICK` / `subarno.mallick.1@oksbi`).
  - **Mock Payment Sandbox**: Fast testing for order flows with celebratory confetti animations.
- **🤖 AI Farming Assistant**:
  - Live **Google Gemini API** integration for advanced natural language agricultural advice.
  - High-precision **Offline Rule-Based Agronomist Engine** with seasonal calendars, organic pesticide recipes (Neem spray), and soil NPK guidance.
- **📦 Relational & Cloud Persistence**: Built with **Mongoose / MongoDB** (supports local MongoDB & MongoDB Atlas).

---

## 🚀 One-Click Deploy to Render

Click the button below to deploy DeshiMart on **Render**:

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

Or follow the detailed instructions in [RENDER_DEPLOY.md](./RENDER_DEPLOY.md).

---

## 💻 Local Development

### 1. Prerequisites
- Node.js (v18+)
- MongoDB running locally or a MongoDB Atlas URI

### 2. Setup & Installation
```bash
# Clone the repository
git clone https://github.com/<YOUR-USERNAME>/deshimart.git
cd deshimart

# Install all dependencies (backend & frontend)
npm run install:all
```

### 3. Environment Variables
Copy `.env.example` to `backend/.env` and update the values:
```bash
cp .env.example backend/.env
```

### 4. Running the App Locally
```bash
# In one terminal: Start the Express Backend (Port 5005)
npm run dev:backend

# In a second terminal: Start the React Vite Frontend (Port 3000)
npm run dev:frontend
```

Visit `http://localhost:3000` in your browser.

---

## 🛠️ Production Build & Test
```bash
# Build frontend and install backend production modules
npm run build

# Start production server
npm start
```
The server will automatically host the React frontend on `http://localhost:5005` (or the port defined by `PORT`).

---

## 📄 License
ISC © Subarno Mallick
