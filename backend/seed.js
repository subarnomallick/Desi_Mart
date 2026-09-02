import crypto from 'crypto';
import User from './models/User.js';
import Product from './models/Product.js';
import { connectDB } from './config/db.js';
import 'dotenv/config';

function hashPassword(password) {
  return crypto.createHmac('sha256', 'salt-key-deshimart').update(password).digest('hex');
}

export async function seedInitialData() {
  try {
    const productCount = await Product.countDocuments();
    if (productCount > 0) {
      console.log(`📦 MongoDB already contains ${productCount} products. Skipping seed.`);
      return;
    }

    console.log('🌱 Seeding initial MongoDB users and products...');

    // 1. Create Demo Farmers and Customers if they don't exist
    let farmerHarpreet = await User.findOne({ email: 'harpreet@deshimart.com' });
    if (!farmerHarpreet) {
      farmerHarpreet = await User.create({
        name: 'Harpreet Singh',
        email: 'harpreet@deshimart.com',
        password_hash: hashPassword('farmer123'),
        role: 'farmer',
        address: 'Amritsar Organic Farm, Punjab',
        phone: '+91 98765 43210'
      });
    }

    let farmerRamesh = await User.findOne({ email: 'ramesh@deshimart.com' });
    if (!farmerRamesh) {
      farmerRamesh = await User.create({
        name: 'Ramesh Patel',
        email: 'ramesh@deshimart.com',
        password_hash: hashPassword('farmer123'),
        role: 'farmer',
        address: 'Green Meadows, Gujarat',
        phone: '+91 98765 12345'
      });
    }

    let demoCustomer = await User.findOne({ email: 'customer@deshimart.com' });
    if (!demoCustomer) {
      demoCustomer = await User.create({
        name: 'Aarav Sharma',
        email: 'customer@deshimart.com',
        password_hash: hashPassword('customer123'),
        role: 'customer',
        address: 'Flat 402, Green Glen Heights, Bengaluru',
        phone: '+91 99887 76655'
      });
    }

    // 2. Initial Agricultural Products
    const initialProducts = [
      {
        name: 'Organic Basmati Rice (Premium)',
        description: 'Aromatically rich, direct from the fields of Punjab. 100% organic and aged to perfection.',
        price: 95.0,
        category: 'crops',
        image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400',
        stock: 500,
        farmer_id: farmerHarpreet._id,
        farmer_name: farmerHarpreet.name
      },
      {
        name: 'Hybrid Tomato Seeds',
        description: 'High-yielding, disease-resistant tomato seeds. Perfect for local soil conditions.',
        price: 150.0,
        category: 'seeds',
        image_url: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&q=80&w=400',
        stock: 200,
        farmer_id: farmerRamesh._id,
        farmer_name: farmerRamesh.name
      },
      {
        name: 'Organic Neem Compost',
        description: 'Premium organic nitrogen-rich fertilizer made from neem cake. Repels pests naturally.',
        price: 250.0,
        category: 'fertilizers',
        image_url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=400',
        stock: 100,
        farmer_id: farmerRamesh._id,
        farmer_name: farmerRamesh.name
      },
      {
        name: 'Farming Sickle & Pruning Shears',
        description: 'Ergonomic hand-forged steel sickle along with heavy-duty crop cutters.',
        price: 350.0,
        category: 'tools',
        image_url: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&q=80&w=400',
        stock: 45,
        farmer_id: farmerHarpreet._id,
        farmer_name: farmerHarpreet.name
      },
      {
        name: 'Fresh Golden Potatoes',
        description: 'Freshly harvested large potatoes, straight from farm soils. Unwashed for longer preservation.',
        price: 30.0,
        category: 'vegetables',
        image_url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=400',
        stock: 1200,
        farmer_id: farmerHarpreet._id,
        farmer_name: farmerHarpreet.name
      },
      {
        name: 'Bio-Fertilizer NPK Spray',
        description: 'Liquid bio-fertilizer containing nitrogen, phosphorus, and potassium fixing bacteria.',
        price: 450.0,
        category: 'fertilizers',
        image_url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=400',
        stock: 80,
        farmer_id: farmerRamesh._id,
        farmer_name: farmerRamesh.name
      }
    ];

    await Product.insertMany(initialProducts);
    console.log(`✅ Seeded ${initialProducts.length} initial products into MongoDB.`);
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
  }
}

// Standalone execution support: node seed.js
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  (async () => {
    await connectDB();
    await seedInitialData();
    process.exit(0);
  })();
}
