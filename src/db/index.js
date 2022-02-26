import { logger } from 'configs/logger';
import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    mongoose.connection.db.dropCollection('rooms');
    mongoose.connection.db.dropCollection('messages');
    mongoose.connection.db.dropCollection('members');
    mongoose.connection.db.dropCollection('requests');
    logger('Success', 'Mongoose is connected!!!');
  } catch (error) {
    console.log(error);
    logger('Error', 'Connect failure!!!');
  }
};
