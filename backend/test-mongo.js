require('dotenv').config();
const mongoose = require('mongoose');

// Enable debug logging
mongoose.set('debug', true);

async function test() {
  try {
    console.log('\n📝 Attempting MongoDB connection...\n');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      tlsAllowInvalidCertificates: true,
      tlsAllowInvalidHostnames: true,
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 20000,
    });

    console.log('\n✅ MongoDB Connected!');
    console.log(`Host: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Connection Failed:');
    console.error(error.message);
    process.exit(1);
  }
}

test();
