import { logger } from 'configs/logger';
import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger('Success', 'Mongoose is connected!!!');
  } catch (error) {
    console.log(error);
    logger('Error', 'Connect failure!!!');
  }
};
