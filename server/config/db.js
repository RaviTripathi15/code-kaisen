import mongoose from 'mongoose';

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/setu';
  try {
    // Try to connect, with a short timeout to fail fast if MongoDB is not running
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`Could not connect to database at ${uri}: ${error.message}`);
    console.log('Starting an In-Memory MongoDB Server fallback for development...');
    
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      
      console.log(`In-Memory MongoDB Server started. Connecting to: ${mongoUri}`);
      const conn = await mongoose.connect(mongoUri);
      console.log(`MongoDB Connected (In-Memory): ${conn.connection.host}`);

      // Auto-seed in-memory database so user has test accounts out of the box
      console.log('Auto-seeding In-Memory MongoDB Server...');
      const { seedData } = await import('../utils/seed.js');
      await seedData(false);
      console.log('Auto-seeding completed.');
    } catch (memError) {
      console.error(`Failed to start In-Memory MongoDB Server: ${memError.message}`);
      process.exit(1);
    }
  }
};

export default connectDB;
