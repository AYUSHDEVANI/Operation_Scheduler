const mongoose = require('mongoose');
const logger = require('../logs/logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // These options are no longer needed in Mongoose 6+, but harmless
    });
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`Error: ${error.message}`);
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
