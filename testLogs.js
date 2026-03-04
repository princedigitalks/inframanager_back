const mongoose = require('mongoose');
require('dotenv').config();

const Log = require('./model/Log');
const User = require('./model/User');

async function checkLogs() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const logs = await Log.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    console.log('\n📋 Recent Logs:');
    console.log('================');
    
    if (logs.length === 0) {
      console.log('❌ No logs found in database');
    } else {
      logs.forEach((log, index) => {
        console.log(`\n${index + 1}. ${log.action}`);
        console.log(`   Details: ${log.details}`);
        console.log(`   User: ${log.user?.name || 'Unknown'} (${log.user?.email || 'N/A'})`);
        console.log(`   Type: ${log.resourceType}`);
        console.log(`   Time: ${log.createdAt}`);
      });
    }

    await mongoose.connection.close();
    console.log('\n✅ Test completed');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkLogs();
