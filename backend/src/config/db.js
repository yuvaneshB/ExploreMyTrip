import mongoose from 'mongoose';
import '../models/user.js';
import '../models/category.js';
import '../models/country.js';
import '../models/city.js';
import '../models/destination.js';
import '../models/tour.js';
import '../models/agentTour.js';
import '../models/wishlist.js';
import '../models/booking.js';
import '../models/payment.js';
import '../models/invoice.js';
import '../models/review.js';
import '../models/refund.js';
import '../models/notification.js';
import '../models/activityLog.js';
import '../models/coupon.js';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 2500 // Fail fast if no local instance is running
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`Local MongoDB Connection Failed: ${error.message}`);
    console.log('Spinning up standalone In-Memory MongoDB Server...');
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      
      const conn = await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log(`In-Memory MongoDB Connected: ${conn.connection.host}`);
    } catch (innerError) {
      console.error(`Fatal Database Error: ${innerError.message}`);
      process.exit(1);
    }
  }
};

export default connectDB;

