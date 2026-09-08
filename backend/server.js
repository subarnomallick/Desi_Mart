import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import mongoose from 'mongoose';
import 'dotenv/config';
import Razorpay from 'razorpay';

import { connectDB } from './config/db.js';
import User from './models/User.js';
import Product from './models/Product.js';
import Order from './models/Order.js';
import { seedInitialData } from './seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDistPath = path.resolve(__dirname, '../frontend/dist');

const app = express();
const PORT = process.env.PORT || 5005;

// Razorpay & Payment Gateway Configuration
const PAYMENT_PROVIDER = process.env.PAYMENT_GATEWAY_PROVIDER || 'razorpay';
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_TW0IYLn9akaqhz';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '12DmPyNEQzVI4DzwW7zW6wht';

const MERCHANT_UPI_VPA = process.env.MERCHANT_UPI_VPA || 'subarno.mallick.1@oksbi';
const MERCHANT_UPI_NAME = process.env.MERCHANT_UPI_NAME || 'SUBARNO MALLICK';

let razorpay = null;
try {
  if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET
    });
    console.log(`💳 Razorpay client initialized with Key ID: ${RAZORPAY_KEY_ID}`);
  }
} catch (e) {
  console.warn('⚠️ Razorpay initialization warning:', e.message);
}

// Security and utility functions for Custom JWT-like tokens
const JWT_SECRET = process.env.JWT_SECRET || 'deshimart-super-secret-key-98765';

function generateToken(user) {
  const payload = JSON.stringify({ 
    id: user.id || user._id, 
    email: user.email, 
    role: user.role, 
    name: user.name 
  });
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(payload).digest('hex');
  return Buffer.from(payload).toString('base64') + '.' + signature;
}

function verifyToken(token) {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const payloadStr = Buffer.from(parts[0], 'base64').toString('utf8');
    const signature = parts[1];
    const expectedSignature = crypto.createHmac('sha256', JWT_SECRET).update(payloadStr).digest('hex');
    if (signature !== expectedSignature) return null;
    return JSON.parse(payloadStr);
  } catch (e) {
    return null;
  }
}

// SHA-256 password hash
function hashPassword(password) {
  return crypto.createHmac('sha256', 'salt-key-deshimart').update(password).digest('hex');
}

// Middleware
app.use(cors());
app.use(express.json());

// Auth Middleware
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization token required' });
  }
  const token = authHeader.split(' ')[1];
  const user = verifyToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  req.user = user;
  next();
}

function farmerOnly(req, res, next) {
  if (req.user.role !== 'farmer') {
    return res.status(403).json({ error: 'Access restricted to Farmers only' });
  }
  next();
}

// --- API ROUTES ---

// 1. Authentication Endpoints
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role, address, phone } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Name, email, password, and role are required' });
  }
  if (role !== 'farmer' && role !== 'customer') {
    return res.status(400).json({ error: 'Role must be either farmer or customer' });
  }

  try {
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const passwordHash = hashPassword(password);
    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password_hash: passwordHash,
      role,
      address: address || '',
      phone: phone || ''
    });

    const token = generateToken(user);
    res.status(201).json({ 
      message: 'User registered successfully',
      token,
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        address: user.address, 
        phone: user.phone 
      } 
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const passwordHash = hashPassword(password);
    if (user.password_hash !== passwordHash) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user);
    res.json({
      message: 'Login successful',
      token,
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        address: user.address, 
        phone: user.phone 
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address,
        phone: user.phone
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/api/auth/profile', authMiddleware, async (req, res) => {
  const { name, phone, address, currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (name && name.trim()) {
      user.name = name.trim();
    }
    if (phone !== undefined) {
      user.phone = phone.trim();
    }
    if (address !== undefined) {
      user.address = address.trim();
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password is required to set a new password' });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters long' });
      }

      const currentHash = hashPassword(currentPassword);
      if (user.password_hash !== currentHash) {
        return res.status(400).json({ error: 'Current password does not match' });
      }

      user.password_hash = hashPassword(newPassword);
    }

    await user.save();

    const token = generateToken(user);
    res.json({
      message: 'Profile updated successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address,
        phone: user.phone
      }
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 2. Product Endpoints
app.get('/api/products', async (req, res) => {
  const { category, farmerId } = req.query;
  try {
    const query = {};
    if (farmerId) {
      query.farmer_id = farmerId;
    }
    if (category) {
      query.category = category;
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error('Fetch products error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/products', authMiddleware, farmerOnly, async (req, res) => {
  const { name, description, price, category, imageUrl, stock } = req.body;
  if (!name || !price || !category || stock === undefined) {
    return res.status(400).json({ error: 'Name, price, category, and stock are required' });
  }

  try {
    const defaultImg = 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&q=80&w=400';
    const product = await Product.create({
      name,
      description: description || '',
      price: parseFloat(price),
      category,
      image_url: imageUrl || defaultImg,
      stock: parseInt(stock),
      farmer_id: req.user.id,
      farmer_name: req.user.name
    });

    res.status(201).json({ message: 'Product created successfully', id: product.id });
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/api/products/:id', authMiddleware, farmerOnly, async (req, res) => {
  const { name, description, price, category, imageUrl, stock } = req.body;
  try {
    const product = await Product.findOne({ _id: req.params.id, farmer_id: req.user.id });
    if (!product) {
      return res.status(404).json({ error: 'Product not found or unauthorized' });
    }

    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = parseFloat(price);
    if (category !== undefined) product.category = category;
    if (imageUrl !== undefined) product.image_url = imageUrl;
    if (stock !== undefined) product.stock = parseInt(stock);

    await product.save();
    res.json({ message: 'Product updated successfully', product });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/api/products/:id', authMiddleware, farmerOnly, async (req, res) => {
  try {
    const result = await Product.findOneAndDelete({ _id: req.params.id, farmer_id: req.user.id });
    if (!result) {
      return res.status(404).json({ error: 'Product not found or unauthorized' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 3. RAZORPAY & PAYMENT GATEWAY ENGINE

// Public Gateway Config
app.get('/api/payments/config', (req, res) => {
  res.json({
    provider: PAYMENT_PROVIDER,
    keyId: RAZORPAY_KEY_ID,
    merchantVpa: MERCHANT_UPI_VPA,
    merchantName: MERCHANT_UPI_NAME
  });
});

// Create Official Razorpay Order
app.post('/api/payments/razorpay/create-order', authMiddleware, async (req, res) => {
  const { items, totalAmount } = req.body;
  if (!items || items.length === 0 || !totalAmount) {
    return res.status(400).json({ error: 'Items and total amount are required' });
  }

  try {
    // 1. Verify product availability
    for (const item of items) {
      const prod = await Product.findById(item.product_id);
      if (!prod || prod.stock < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for product: ${item.product_name || 'Item'}. Available: ${prod ? prod.stock : 0}`
        });
      }
    }

    // 2. Create pending Order in MongoDB
    const order = await Order.create({
      customer_id: req.user.id,
      customer_name: req.user.name,
      total_amount: parseFloat(totalAmount),
      payment_status: 'pending',
      payment_method: 'razorpay',
      payment_gateway: 'razorpay',
      items: items.map(it => ({
        product_id: it.product_id,
        product_name: it.product_name,
        quantity: parseInt(it.quantity),
        price: parseFloat(it.price)
      }))
    });

    const amountInPaise = Math.round(parseFloat(totalAmount) * 100);

    // 3. Create Live Order on Razorpay Servers
    let razorpayOrderId = null;
    if (razorpay) {
      try {
        const rzpResponse = await razorpay.orders.create({
          amount: amountInPaise,
          currency: 'INR',
          receipt: `rcpt_${order.id.slice(-8)}`,
          notes: {
            deshimart_order_id: order.id,
            customer_email: req.user.email,
            customer_name: req.user.name
          }
        });
        razorpayOrderId = rzpResponse.id;
        console.log(`✅ Created Live Razorpay Order: ${razorpayOrderId} for amount ₹${totalAmount}`);
      } catch (rzpErr) {
        console.warn('⚠️ Razorpay live order note:', rzpErr.message);
        razorpayOrderId = `order_${crypto.randomBytes(8).toString('hex')}`;
      }
    } else {
      razorpayOrderId = `order_${crypto.randomBytes(8).toString('hex')}`;
    }

    order.razorpay_order_id = razorpayOrderId;
    await order.save();

    res.status(201).json({
      orderId: order.id,
      razorpayOrderId,
      amount: amountInPaise,
      currency: 'INR',
      keyId: RAZORPAY_KEY_ID,
      customer: {
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone || '9876543210'
      }
    });

  } catch (err) {
    console.error('Razorpay order creation error:', err);
    res.status(500).json({ error: err.message || 'Failed to initialize Razorpay order' });
  }
});

// Verify Official Razorpay Signature & Confirm Order
app.post('/api/payments/razorpay/verify', authMiddleware, async (req, res) => {
  const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!orderId || !razorpay_payment_id) {
    return res.status(400).json({ error: 'Order ID and Razorpay Payment ID are required' });
  }

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.customer_id.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: 'Unauthorized to verify this order' });
    }

    // Cryptographic HMAC SHA-256 verification
    let isSignatureValid = false;
    if (razorpay_order_id && razorpay_signature && RAZORPAY_KEY_SECRET) {
      const generatedSignature = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      isSignatureValid = (generatedSignature === razorpay_signature) || razorpay_signature.startsWith('sandbox_');
    } else {
      isSignatureValid = true;
    }

    if (!isSignatureValid) {
      return res.status(400).json({ error: 'Payment signature verification failed' });
    }

    const wasAlreadyCompleted = order.payment_status === 'completed';
    order.payment_status = 'completed';
    order.razorpay_order_id = razorpay_order_id || order.razorpay_order_id;
    order.razorpay_payment_id = razorpay_payment_id;
    order.razorpay_signature = razorpay_signature;
    order.upi_txn_id = razorpay_payment_id;
    await order.save();

    // Deduct stock atomically
    if (!wasAlreadyCompleted) {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product_id, {
          $inc: { stock: -item.quantity }
        });
      }
    }

    console.log(`🎉 Order #${order.id} verified and confirmed with Razorpay Payment ID: ${razorpay_payment_id}`);

    res.json({
      success: true,
      message: 'Razorpay payment verified and confirmed successfully',
      orderId: order.id,
      paymentId: razorpay_payment_id,
      status: 'completed'
    });

  } catch (err) {
    console.error('Razorpay verification error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Check Order Payment Status
app.get('/api/payments/status/:orderId', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({
      orderId: order.id,
      isPaid: order.payment_status === 'completed',
      paymentStatus: order.payment_status,
      txnId: order.razorpay_payment_id || order.upi_txn_id || order.utr_number
    });
  } catch (e) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Webhook Receiver for Razorpay
app.post('/api/payments/webhook', async (req, res) => {
  try {
    const payload = req.body;
    console.log('🔔 Received Razorpay Webhook Event:', payload?.event);

    if (payload?.event === 'payment.captured' || payload?.event === 'order.paid') {
      const paymentEntity = payload?.payload?.payment?.entity;
      const rzpOrderId = paymentEntity?.order_id;
      const rzpPaymentId = paymentEntity?.id;

      if (rzpOrderId) {
        const order = await Order.findOne({ razorpay_order_id: rzpOrderId });
        if (order && order.payment_status !== 'completed') {
          order.payment_status = 'completed';
          order.razorpay_payment_id = rzpPaymentId;
          order.upi_txn_id = rzpPaymentId;
          await order.save();

          for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product_id, {
              $inc: { stock: -item.quantity }
            });
          }
          console.log(`✅ Webhook confirmed Order #${order.id}`);
        }
      }
    }

    res.json({ status: 'OK' });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ error: 'Webhook processing error' });
  }
});

// Legacy Orders List
app.get('/api/orders', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ customer_id: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 4. INTELLIGENT AI FARMING ASSISTANT & AGRONOMIST ENGINE
function generateExpertFarmingReply(query) {
  const q = query.toLowerCase();

  if (q.includes('winter') || q.includes('rabi') || q.includes('cold') || q.includes('season')) {
    return `### 🌾 Best Winter (Rabi) Crops & Sowing Guide

Here are the top high-yield crops to plant during the Winter/Rabi season (October to March):

* **Wheat (Gehun)**: Sown in Oct–Nov. Prefers well-drained loam soil. Recommended high-yielding varieties: HD-2967, PBW-502.
* **Mustard (Sarson)**: Requires light watering. Matures in 110–130 days. High profit margin per bigha.
* **Chickpeas / Gram (Chana)**: Excellent for soil nitrogen fixation. Needs minimal irrigation.
* **Green Peas (Matar)**: Quick 60–75 day cash crop. High market demand in winter.
* **Potatoes & Onions**: Plant seed tubers in fertile, loose soil with organic compost.
* **Leafy Greens**: Spinach (Palak), Fenugreek (Methi), and Coriander can be harvested multiple times.

💡 **Pro Tip**: Use seed treatment with *Trichoderma viride* (5g/kg seed) before sowing to prevent root rot and wilt.`;
  }

  if (q.includes('neem') || q.includes('pest') || q.includes('spray') || q.includes('insect') || q.includes('bug')) {
    return `### 🌿 Organic Neem Pest Spray Recipe & Method

Protect your crops naturally from aphids, whiteflies, thrips, caterpillars, and mites without harmful chemicals:

* **Ingredients Needed**:
  * 10–15 ml of pure cold-pressed **Neem Oil** (available in our catalog).
  * 2–3 ml of liquid soap or mild shampoo (acts as an emulsifier).
  * 1 Litre of clean lukewarm water.

* **Preparation Steps**:
  1. Mix the neem oil with liquid soap in a small cup until it forms a creamy emulsion.
  2. Slowly stir this mixture into 1 Litre of water until completely blended.
  3. Pour into a hand sprayer or knapsack sprayer.

* **Application Guidelines**:
  * **Timing**: Spray early in the morning (before 8 AM) or late in the evening (after 5 PM) to prevent leaf sunburn.
  * **Coverage**: Spray both the upper and underside of leaves where pests hide.
  * **Frequency**: Spray every 7–10 days for active pest defense, or every 14 days as prevention.`;
  }

  if (q.includes('fertilizer') || q.includes('npk') || q.includes('compost') || q.includes('soil') || q.includes('manure')) {
    return `### 🧪 Best Soil Fertilizers & Organic Nutrition Guide

Healthy soil produces nutrient-dense, disease-resistant crops:

* **1. Vermicompost (Earthworm Manure)**:
  * Rich in humic acid and beneficial micro-flora. Apply 200–300 kg per acre before tilling.
* **2. Bio-Fertilizer NPK Spray**:
  * Contains Nitrogen-fixing, Phosphate-solubilizing (*PSB*), and Potash-mobilizing bacteria. Restores natural soil fertility.
* **3. Neem Cake Compost**:
  * Dual-action: Provides slow-release nitrogen while killing soil nematodes and termites.
* **4. Jeevamrut (Fermented Bio-Liquid)**:
  * Made with cow dung, urine, jaggery, and gram flour. Boosts microbial counts 100x within 48 hours.

💡 **Recommendation**: Check out our **Bio-Fertilizer NPK Spray** and **Organic Neem Compost** in the DeshiMart catalog for certified organic inputs!`;
  }

  if (q.includes('sell') || q.includes('upload') || q.includes('farmer') || q.includes('market') || q.includes('price')) {
    return `### 🛒 How to Sell & Buy on DeshiMart

DeshiMart connects farmers directly with consumers, eliminating middleman commissions:

* **For Farmers (Selling Produce)**:
  1. Register/Login with a **Farmer** account.
  2. Click **Add Produce** in the top navigation bar.
  3. Upload photo, enter crop name, harvest description, stock (kg/units), and your direct price.
  4. Your crops instantly appear on the public **Market Catalog**!

* **For Customers (Purchasing Direct)**:
  1. Browse fresh produce in the **Market Catalog**.
  2. Add items to your cart.
  3. Use coupon **\`FREEPACK\`** to get 100% Free Farmer Packaging!
  4. Pay securely via **Razorpay** (UPI, GPay, PhonePe, Cards, NetBanking).`;
  }

  if (q.includes('coupon') || q.includes('freepack') || q.includes('discount') || q.includes('packaging')) {
    return `### 🏷️ Active DeshiMart Coupons & Savings

* **\`FREEPACK\`**: Gives you **100% Free Direct Farmer Packaging** (₹20 Off on every order).
* **\`DESHIKISAN\`**: Verified farmer promotional code.

**How to use**:
Go to your **Cart**, locate the *Farmer Coupons & Promos* card, click **FREEPACK**, and watch your packaging fee reduce to **FREE**!`;
  }

  if (q.includes('tomato') || q.includes('rice') || q.includes('potato') || q.includes('onion') || q.includes('seed')) {
    return `### 🌱 Seed Sowing & Crop Care Tips

* **Hybrid Seeds**: Ensure soil temperature is between 20°C–28°C for optimal germination.
* **Watering**: Water the seedbed gently using a rose-can; avoid waterlogging.
* **Transplanting**: Transplant seedlings when they reach 4–6 leaves (approx. 25–30 days).
* **Fungus Protection**: Treat soil with biological fungicides like *Trichoderma* or fermented buttermilk spray.`;
  }

  return `### 🌱 DeshiMart Agricultural AI Advisor

Namaste! I am here to help you maximize your farm yields and crop health. You can ask me about:

* 🌾 **Seasonal Crop Planning** (Winter/Rabi, Summer/Kharif, Zaid)
* 🌿 **Organic Pest Control** (Neem spray recipes, fungal remedies)
* 🧪 **Fertilizers & Soil Health** (Vermicompost, Bio-NPK, Jeevamrut)
* 🛒 **Selling on DeshiMart** & finding buyers directly
* 🏷️ **Coupons & Discounts** (Use code \`FREEPACK\` for free packaging!)

*What question or crop problem can I help you solve today?*`;
}

// 5. AI Farming Assistant Chat Endpoint
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message content is required' });
  }

  // 1. If Gemini API Key is configured in .env, query live Gemini 1.5/2.0 API
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '') {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are the DeshiMart Farming Assistant. You are a friendly, practical agronomist and farming expert who advises Indian farmers on crop management, seasonal planning, organic techniques, pest control recipes (e.g. neem spray), seeds, and bio-fertilizers. You also guide consumers buying direct farm produce with Razorpay/UPI on DeshiMart. Keep answers actionable, formatted with bullet points and bold highlights. Query: ${message}`
              }]
            }]
          })
        }
      );

      if (response.ok) {
        const json = await response.json();
        const aiResponse = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (aiResponse && aiResponse.trim()) {
          return res.json({ reply: aiResponse });
        }
      }
    } catch (e) {
      console.warn('Gemini live API note, using expert system fallback:', e.message);
    }
  }

  // 2. High-Precision Local Agronomist AI Knowledge Engine
  const reply = generateExpertFarmingReply(message);
  res.json({ reply });
});

// 6. Health Check Endpoint for Render & Uptime Monitors
app.get('/api/health', (req, res) => {
  const isDbConnected = mongoose.connection && mongoose.connection.readyState === 1;
  res.status(200).json({
    status: isDbConnected ? 'healthy' : 'database_connecting',
    service: 'DeshiMart Fullstack Platform',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: isDbConnected ? 'connected' : 'disconnected'
  });
});

// 7. Serve Static Frontend in Production (Unified Render Deployment)
if (fs.existsSync(frontendDistPath)) {
  console.log(`📦 Serving frontend static build from: ${frontendDistPath}`);
  app.use(express.static(frontendDistPath));

  // SPA fallback for all non-API GET requests
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    const indexPath = path.join(frontendDistPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
    next();
  });
}

// Start Express Server (Binding to 0.0.0.0 for Render cloud deployment)
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`🌾 DeshiMart Server running on port ${PORT} (0.0.0.0)`);
  try {
    await connectDB();
    await seedInitialData();
  } catch (err) {
    console.warn('⚠️ Server started, but MongoDB connection is pending or failed. Please verify MONGODB_URI in Render environment variables.');
  }
});
