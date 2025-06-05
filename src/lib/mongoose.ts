import mongoose from 'mongoose';
import type { ConnectOptions } from 'mongoose';

import config from '@/config';

const clientOptions: ConnectOptions = {
  dbName: 'blogpanda',
  appName: 'Blog Panda',
  serverApi: {
    version: '1',
    strict: true,
    deprecationErrors: true,
  },
};

/**
 * Establishes a connection to the MongoDB using Mongoose.
 * If an error occurs during the connection process, it throws an error with a descriptive message.
 *
 * - Uses `MONGO_URI` as the connection string.
 * - `clientOptions` contains the additional configuration for Mongoose.
 * - Errors are properly handled and rethrown for better debugging.
 */
export const connectToDatabase = async (): Promise<void> => {
  if (!config.MONGO_URI) {
    throw new Error('MONGO_URI is not defined');
  }

  try {
    await mongoose.connect(config.MONGO_URI, clientOptions);
    console.log('Connected to MongoDB successfully', {
      uri: config.MONGO_URI,
      options: clientOptions,
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error connecting to MongoDB: ${error.message}`);
    }
    console.log('Error connecting to MongoDB', error);
  }
};

/**
 * Disconnects from the MongoDB database using Mongoose.
 *
 * This function attempts to disconnect from the database asynchronously.
 * If the disconnection is successful, a success message is logged.
 * If an error occurs during disconnection, it is either re-thrown as a new Error (if it's an instance of Error) or logged to the console.
 */
export const disconnectFromDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB successfully', {
      uri: config.MONGO_URI,
      options: clientOptions,
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error disconnecting from MongoDB: ${error.message}`);
    }
    console.log('Error disconnecting from MongoDB', error);
  }
};
