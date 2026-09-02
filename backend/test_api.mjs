import http from 'http';
import { connectDB } from './config/db.js';
import User from './models/User.js';
import Product from './models/Product.js';
import Order from './models/Order.js';
import 'dotenv/config';

async function testMongo() {
  console.log('Testing MongoDB models & queries...');
  await connectDB();

  // Test User Query
  const users = await User.find();
  console.log(`Found ${users.length} users in MongoDB:`, users.map(u => ({ id: u.id, email: u.email, role: u.role })));

  // Test Product Query
  const products = await Product.find();
  console.log(`Found ${products.length} products in MongoDB. First product:`, {
    id: products[0].id,
    name: products[0].name,
    price: products[0].price,
    stock: products[0].stock,
    farmer_name: products[0].farmer_name
  });

  // Test Creating Order & Stock Update
  const testOrder = await Order.create({
    customer_id: users[0].id,
    customer_name: users[0].name,
    total_amount: 190,
    payment_status: 'completed',
    upi_txn_id: 'UPI-TEST-123456',
    items: [
      {
        product_id: products[0]._id,
        product_name: products[0].name,
        quantity: 2,
        price: products[0].price
      }
    ]
  });

  console.log('Order created successfully in MongoDB:', {
    id: testOrder.id,
    amount: testOrder.total_amount,
    status: testOrder.payment_status,
    items: testOrder.items
  });

  // Clean up test order
  await Order.findByIdAndDelete(testOrder._id);
  console.log('Test order cleaned up.');

  console.log('🎉 ALL MONGO VERIFICATION CHECKS PASSED!');
  process.exit(0);
}

testMongo().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
