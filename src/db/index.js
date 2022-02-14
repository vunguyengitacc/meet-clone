import { logger } from 'configs/logger.config';
import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });
    logger('Success', 'Mongoose is connected!!!');
  } catch (error) {
    logger('Error', 'Connect failure!!!');
  }
};
