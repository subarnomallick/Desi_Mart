# 🚀 Deploying DeshiMart on Render (Step-by-Step Guide)

DeshiMart is configured as a **Unified Fullstack Web Service** on Render. The Express backend serves the pre-built React frontend as static assets, which means:
- ✅ **1 Single Free Web Service**: Runs frontend and backend together on Render's free tier.
- ✅ **Zero CORS Issues**: Frontend and API share the exact same domain.
- ✅ **Zero Complex Setup**: Automatically builds and boots with `npm run build` & `npm start`.

---

## 📋 Prerequisites
1. A **GitHub** account ([github.com](https://github.com))
2. A **Render** account ([render.com](https://render.com))
3. A free **MongoDB Atlas** database ([mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas))

---

## Step 1: Get a Free MongoDB Atlas Database (3 minutes)

Render does not host databases directly on the free tier, so MongoDB Atlas (official free tier) is used:

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and sign in/up.
2. Click **Create a Deployment** -> choose **M0 Free Tier**.
3. Under **Security Quickstart**:
   - Create a database user (e.g. Username: `deshiadmin`, Password: Choose a strong password and save it!).
4. Under **Network Access**:
   - Click **Add IP Address** -> select **Allow Access from Anywhere (`0.0.0.0/0`)** (Required so Render's cloud servers can connect).
5. Go to **Database** -> Click **Connect** -> Choose **Drivers** (Node.js).
6. Copy the connection string. It looks like:
   ```text
   mongodb+srv://deshiadmin:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   ```
7. Replace `<password>` with your actual password, and append the database name `/deshimart`:
   ```text
   mongodb+srv://deshiadmin:MyPassword123@cluster0.abcde.mongodb.net/deshimart?retryWrites=true&w=majority
   ```
   *(Save this URI for Step 3).*

---

## Step 2: Push DeshiMart to your GitHub

Open your terminal in `/Users/subarnomallick/Downloads/deshimart`:

```bash
cd /Users/subarnomallick/Downloads/deshimart

# 1. Initialize git (if not already initialized)
git init

# 2. Add all files (.gitignore already protects node_modules and .env)
git add .

# 3. Commit the changes
git commit -m "Configure DeshiMart for Render deployment"

# 4. Create a new repository on GitHub (named 'deshimart'), then link and push:
git branch -M main
git remote add origin https://github.com/<YOUR-GITHUB-USERNAME>/deshimart.git
git push -u origin main
```

---

## Step 3: Deploy on Render

### Method A: Using Render Blueprint (`render.yaml`) — *Recommended & Fastest*

1. Log in to [dashboard.render.com](https://dashboard.render.com/).
2. Click **New +** (top right) -> Select **Blueprint**.
3. Connect your GitHub account and select your `deshimart` repository.
4. Render will detect `render.yaml` automatically and prompt you for the environment variables:
   - **`MONGODB_URI`**: Paste your MongoDB Atlas URI from Step 1.
   - **`RAZORPAY_KEY_ID`**: `rzp_test_TW0IYLn9akaqhz` (or your own live key).
   - **`RAZORPAY_KEY_SECRET`**: `12DmPyNEQzVI4DzwW7zW6wht` (or your own secret).
   - **`MERCHANT_UPI_VPA`**: `subarno.mallick.1@oksbi`
   - **`MERCHANT_UPI_NAME`**: `SUBARNO MALLICK`
   - **`GEMINI_API_KEY`**: *(Optional)* Leave blank for built-in expert AI, or add your Gemini key.
5. Click **Apply**. Render will automatically build the React frontend and launch the Node.js server!

---

### Method B: Manual Web Service Setup

If you prefer to configure manually via the Render dashboard:

1. Click **New +** -> **Web Service**.
2. Select your `deshimart` repository.
3. Configure the settings:
   - **Name**: `deshimart` (or your preferred name)
   - **Region**: Choose the closest region (e.g. *Singapore* or *Oregon*)
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
4. Under **Environment Variables**, add the following:
   | Key | Value | Notes |
   |---|---|---|
   | `NODE_ENV` | `production` | Production mode |
   | `PORT` | `10000` | Port used by Render |
   | `MONGODB_URI` | `mongodb+srv://.../deshimart?...` | Your Atlas MongoDB URI |
   | `JWT_SECRET` | *(click Generate or enter any random string)* | Auth signing key |
   | `PAYMENT_GATEWAY_PROVIDER` | `razorpay` | Default gateway |
   | `RAZORPAY_KEY_ID` | `rzp_test_TW0IYLn9akaqhz` | Razorpay Key ID |
   | `RAZORPAY_KEY_SECRET` | `12DmPyNEQzVI4DzwW7zW6wht` | Razorpay Secret |
   | `MERCHANT_UPI_VPA` | `subarno.mallick.1@oksbi` | Payee UPI ID |
   | `MERCHANT_UPI_NAME` | `SUBARNO MALLICK` | Payee Name |
   | `GEMINI_API_KEY` | *(Optional)* | Google AI key |
5. Under **Health Check Path**, enter: `/api/health`
6. Click **Create Web Service**.

---

## Step 4: Verification & Live URL

1. Watch the Render deployment logs. You will see:
   ```text
   ==> Running build command 'npm run build'...
   ✓ built in 2.70s
   ==> Starting service with 'npm start'...
   💳 Razorpay client initialized
   📦 Serving frontend static build from /opt/render/project/src/frontend/dist
   🌾 DeshiMart Server running on port 10000 (0.0.0.0)
   ✅ MongoDB Connected
   ==> Your service is live at https://deshimart.onrender.com
   ```
2. Click your live URL (e.g. `https://deshimart.onrender.com`).
3. You can verify health anytime by visiting `https://deshimart.onrender.com/api/health`.

---

## 🛠️ Troubleshooting Tips

* **MongoDB Connection Times Out**:
  Ensure in MongoDB Atlas -> **Network Access** that `0.0.0.0/0` (Allow Access from Anywhere) is active. Cloud providers like Render use dynamic IP addresses.
* **Render Free Tier Cold Starts**:
  Render free web services spin down after 15 minutes of inactivity. When someone visits the site, it may take 30-50 seconds to wake up. This is normal on the free tier.
* **Database Auto-Seeding**:
  On first boot, DeshiMart automatically seeds demo farmers (Harpreet, Ramesh) and agricultural products (seeds, fertilizers, crops, tools).
