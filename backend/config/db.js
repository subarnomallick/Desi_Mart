import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/deshimart';
  
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error(`
========================================================================
💡 RENDER DEPLOYMENT TIP:
If deploying on Render, please make sure you set the 'MONGODB_URI'
environment variable in your Render Dashboard.
Example: mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/deshimart?retryWrites=true&w=majority
You can create a 100% free MongoDB database at: https://www.mongodb.com/cloud/atlas
========================================================================
`);
    throw error;
  }
}
