require('dotenv').config();
const https = require('https');
const dns = require('dns').promises;

async function testConnection() {
  try {
    console.log('🔍 Testing MongoDB Atlas Connection...\n');

    // Extract cluster host
    const mongoUri = process.env.MONGODB_URI;
    const match = mongoUri.match(/@(.+?)\//);
    const clusterHost = match ? match[1] : null;
    
    if (!clusterHost) {
      console.error('❌ Could not extract cluster host from MONGODB_URI');
      return;
    }

    console.log(`📍 Cluster Host: ${clusterHost}`);
    
    // DNS resolution test
    console.log('\n🌐 DNS Resolution Test...');
    try {
      const addresses = await dns.resolve4(clusterHost);
      console.log(`✅ DNS resolved to: ${addresses.join(', ')}`);
    } catch (err) {
      console.error(`❌ DNS resolution failed: ${err.message}`);
      return;
    }

    // HTTP connectivity test
    console.log('\n🔗 HTTPS Connectivity Test...');
    const testUrl = `https://${clusterHost}:443`;
    
    const request = https.get(testUrl, { timeout: 5000 }, (res) => {
      console.log(`✅ HTTPS connection established`);
      console.log(`   Status Code: ${res.statusCode}`);
    });

    request.on('error', (err) => {
      console.error(`❌ HTTPS connection failed: ${err.message}`);
    });

    request.on('timeout', () => {
      console.error('❌ Connection timed out');
      request.destroy();
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testConnection();
