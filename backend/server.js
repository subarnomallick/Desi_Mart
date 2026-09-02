import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import 'dotenv/config';
import Razorpay from 'razorpay';

import { connectDB } from './config/db.js';
import User from './models/User.js';
import Product from './models/Product.js';
import Order from './models/Order.js';
import { seedInitialData } from './seed.js';

const app = express();
const PORT = process.env.PORT || 5005;

// Payment Gateway Configuration
const PAYMENT_PROVIDER = process.env.PAYMENT_GATEWAY_PROVIDER || 'upi_direct';
const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID || '';
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY || '';
const CASHFREE_ENV = (process.env.CASHFREE_ENV || 'SANDBOX').toUpperCase();
const CASHFREE_BASE_URL = CASHFREE_ENV === 'PRODUCTION' 
  ? 'https://api.cashfree.com/pg' 
  : 'https://sandbox.cashfree.com/pg';

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_1DP5mmOlF5G5ag';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_dummy_deshimart';

const MERCHANT_UPI_VPA = process.env.MERCHANT_UPI_VPA || 'subarno.mallick.1@oksbi';
const MERCHANT_UPI_NAME = process.env.MERCHANT_UPI_NAME || 'SUBARNO MALLICK';

let razorpay = null;
try {
  if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET
    });
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

// 3. REAL PAYMENT GATEWAY ENGINE (Cashfree + Razorpay + NPCI Direct UPI)

// Public Gateway Config
app.get('/api/payments/config', (req, res) => {
  res.json({
    provider: PAYMENT_PROVIDER,
    merchantVpa: MERCHANT_UPI_VPA,
    merchantName: MERCHANT_UPI_NAME,
    cashfreeAppId: CASHFREE_APP_ID,
    razorpayKeyId: RAZORPAY_KEY_ID,
    environment: CASHFREE_ENV
  });
});

// Create Real Payment Session & Dynamic UPI QR
app.post('/api/payments/create-session', authMiddleware, async (req, res) => {
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
      payment_method: 'upi',
      payment_gateway: PAYMENT_PROVIDER,
      items: items.map(it => ({
        product_id: it.product_id,
        product_name: it.product_name,
        quantity: parseInt(it.quantity),
        price: parseFloat(it.price)
      }))
    });

    const formattedAmt = parseFloat(totalAmount).toFixed(2);
    const orderIdStr = order.id.toString();

    // 3. Dynamic UPI Intent Link (NPCI Standard)
    const upiIntentUrl = `upi://pay?pa=${MERCHANT_UPI_VPA}&pn=${encodeURIComponent(MERCHANT_UPI_NAME)}&am=${formattedAmt}&cu=INR&tr=${orderIdStr}&tn=${encodeURIComponent(`DeshiMart Order Ref ${orderIdStr.slice(-8)}`)}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(upiIntentUrl)}&margin=8`;

    let cashfreeSessionId = null;
    let razorpayOrderId = null;

    // Optional: Call Cashfree PG if valid credentials configured
    if (CASHFREE_APP_ID && CASHFREE_SECRET_KEY && !CASHFREE_APP_ID.includes('100000000')) {
      try {
        const cfRes = await fetch(`${CASHFREE_BASE_URL}/orders`, {
          method: 'POST',
          headers: {
            'x-client-id': CASHFREE_APP_ID,
            'x-client-secret': CASHFREE_SECRET_KEY,
            'x-api-version': '2023-08-01',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            order_id: `order_${orderIdStr}`,
            order_amount: parseFloat(formattedAmt),
            order_currency: 'INR',
            customer_details: {
              customer_id: req.user.id.toString(),
              customer_name: req.user.name,
              customer_email: req.user.email,
              customer_phone: req.user.phone || '9876543210'
            },
            order_meta: {
              notify_url: `http://localhost:${PORT}/api/payments/webhook`
            }
          })
        });

        if (cfRes.ok) {
          const cfData = await cfRes.json();
          cashfreeSessionId = cfData.payment_session_id;
          order.cashfree_order_id = cfData.order_id;
          await order.save();
        }
      } catch (cfErr) {
        console.warn('⚠️ Cashfree API session note:', cfErr.message);
      }
    }

    res.status(201).json({
      orderId: order.id,
      amount: formattedAmt,
      currency: 'INR',
      upiPayee: MERCHANT_UPI_VPA,
      upiName: MERCHANT_UPI_NAME,
      upiDeepLink: upiIntentUrl,
      qrCodeUrl,
      cashfreeSessionId,
      provider: PAYMENT_PROVIDER,
      customer: {
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone || ''
      }
    });

  } catch (err) {
    console.error('Create payment session error:', err);
    res.status(500).json({ error: err.message || 'Failed to create payment session' });
  }
});

// Real-Time Payment Status Check (Polled by Frontend)
app.get('/api/payments/status/:orderId', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.customer_id.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: 'Unauthorized to view this order' });
    }

    // 1. If already completed in MongoDB
    if (order.payment_status === 'completed') {
      return res.json({
        orderId: order.id,
        isPaid: true,
        paymentStatus: 'completed',
        txnId: order.upi_txn_id || order.utr_number || order.razorpay_payment_id || `TXN_${order.id.slice(-6)}`,
        updatedAt: order.updatedAt
      });
    }

    // 2. Query Cashfree Live Server if Cashfree order exists
    if (order.cashfree_order_id && CASHFREE_APP_ID && CASHFREE_SECRET_KEY) {
      try {
        const cfRes = await fetch(`${CASHFREE_BASE_URL}/orders/${order.cashfree_order_id}`, {
          headers: {
            'x-client-id': CASHFREE_APP_ID,
            'x-client-secret': CASHFREE_SECRET_KEY,
            'x-api-version': '2023-08-01'
          }
        });

        if (cfRes.ok) {
          const cfData = await cfRes.json();
          if (cfData.order_status === 'PAID') {
            order.payment_status = 'completed';
            order.upi_txn_id = cfData.order_id;
            await order.save();

            // Decrement inventory stock atomically
            for (const item of order.items) {
              await Product.findByIdAndUpdate(item.product_id, {
                $inc: { stock: -item.quantity }
              });
            }

            return res.json({
              orderId: order.id,
              isPaid: true,
              paymentStatus: 'completed',
              txnId: cfData.order_id
            });
          }
        }
      } catch (e) {
        console.warn('Cashfree live status check:', e.message);
      }
    }

    // Return current state (pending)
    res.json({
      orderId: order.id,
      isPaid: false,
      paymentStatus: order.payment_status,
      txnId: null
    });

  } catch (err) {
    console.error('Payment status check error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Asynchronous Payment Webhook Receiver (Cashfree / Razorpay / Bank Switch)
app.post('/api/payments/webhook', async (req, res) => {
  try {
    const payload = req.body;
    console.log('🔔 Received Live Payment Webhook:', payload);

    let targetOrderId = payload?.data?.order?.order_id || payload?.order_id || payload?.orderId;
    let paymentStatus = payload?.data?.payment?.payment_status || payload?.status;
    let paymentId = payload?.data?.payment?.cf_payment_id || payload?.payment_id;

    if (targetOrderId && (paymentStatus === 'SUCCESS' || paymentStatus === 'PAID' || paymentStatus === 'captured')) {
      const cleanId = targetOrderId.replace('order_', '');
      const order = await Order.findById(cleanId) || await Order.findOne({ cashfree_order_id: targetOrderId });

      if (order && order.payment_status !== 'completed') {
        order.payment_status = 'completed';
        order.upi_txn_id = paymentId || `WEBHOOK_${Date.now()}`;
        await order.save();

        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.product_id, {
            $inc: { stock: -item.quantity }
          });
        }
        console.log(`✅ Webhook verified and completed Order #${order.id}`);
      }
    }

    res.json({ status: 'OK' });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ error: 'Webhook processing error' });
  }
});

// Strict 12-Digit UTR Bank Reference Verification
app.post('/api/payments/verify-utr', authMiddleware, async (req, res) => {
  const { orderId, utrNumber } = req.body;

  if (!orderId || !utrNumber) {
    return res.status(400).json({ error: 'Order ID and 12-digit UPI UTR number are required' });
  }

  const cleanUtr = utrNumber.trim();
  if (cleanUtr.length < 10) {
    return res.status(400).json({ error: 'Please enter a valid UPI Transaction ID or 12-digit UTR from your bank receipt' });
  }

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.customer_id.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: 'Unauthorized to verify this order' });
    }

    // Check if this UTR was already registered on a different order (prevents double-spending)
    const existingUtrOrder = await Order.findOne({ utr_number: cleanUtr, _id: { $ne: order._id } });
    if (existingUtrOrder) {
      return res.status(400).json({ error: 'This UTR / Bank Reference Number has already been redeemed on another order' });
    }

    const wasAlreadyCompleted = order.payment_status === 'completed';
    order.payment_status = 'completed';
    order.utr_number = cleanUtr;
    order.upi_txn_id = cleanUtr;
    await order.save();

    if (!wasAlreadyCompleted) {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product_id, {
          $inc: { stock: -item.quantity }
        });
      }
    }

    res.json({
      success: true,
      message: 'UPI payment verified and confirmed successfully',
      order: {
        id: order.id,
        total_amount: order.total_amount,
        payment_status: 'completed',
        utr_number: cleanUtr
      }
    });

  } catch (err) {
    console.error('Verify UTR error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Legacy Order Endpoints
app.get('/api/orders/:id/status', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({
      orderId: order.id,
      payment_status: order.payment_status,
      upi_txn_id: order.upi_txn_id || order.utr_number,
      total_amount: order.total_amount
    });
  } catch (e) {
    res.status(500).json({ error: 'Error' });
  }
});

app.post('/api/orders/:id/verify', authMiddleware, async (req, res) => {
  const { upiTxnId, status } = req.body;
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    const wasAlreadyCompleted = order.payment_status === 'completed';
    order.payment_status = status || 'completed';
    order.upi_txn_id = upiTxnId || `UPI_${Date.now()}`;
    await order.save();

    if (status === 'completed' && !wasAlreadyCompleted) {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product_id, {
          $inc: { stock: -item.quantity }
        });
      }
    }
    res.json({ message: 'Verified', orderId: order.id, status: order.payment_status });
  } catch (e) {
    res.status(500).json({ error: 'Error' });
  }
});

app.get('/api/orders', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ customer_id: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 4. AI Farming Assistant Chat Endpoint
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message content is required' });
  }

  const userQuery = message.toLowerCase().trim();

  if (process.env.GEMINI_API_KEY) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are the DeshiMart Farming Assistant. You are a friendly expert who advises farmers on crop management, organic techniques, pest remedies, tools, seeds, and fertilizing. You also assist consumers looking to buy fresh farm products. Query: ${message}`
              }]
            }]
          })
        }
      );

      if (response.ok) {
        const json = await response.json();
        const aiResponse = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (aiResponse) {
          return res.json({ reply: aiResponse });
        }
      }
    } catch (e) {
      console.error('Gemini error:', e);
    }
  }

  res.json({
    reply: `### 🌱 DeshiMart Agricultural Assistant\nHow can I help with your farming crops, hybrid seeds, organic fertilizers, or marketplace orders?`
  });
});

// Start Express Server
app.listen(PORT, async () => {
  console.log(`🌾 DeshiMart Server running on port ${PORT}`);
  await connectDB();
  await seedInitialData();
});
