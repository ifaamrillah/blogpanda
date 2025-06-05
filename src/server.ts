import express from 'express';
import cors, { CorsOptions } from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import helmet from 'helmet';

import config from '@/config';

import limiter from '@/lib/express-rate-limit';
import { connectToDatabase, disconnectFromDatabase } from '@/lib/mongoose';

import v1Routes from '@/routes/v1';

const app = express();

// Configure CORS
const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (
      config.NODE_ENV === 'development' ||
      !origin ||
      config.WHITELIST_ORIGINS.includes(origin)
    ) {
      callback(null, true);
    } else {
      // reject request from non-whitelisted origins
      const errMsg = `CORS Error: ${origin} is not allowed by CORS`;
      console.log(errMsg);
      callback(new Error(errMsg), false);
    }
  },
};
app.use(cors(corsOptions));

// Enable JSON request body parsing
// `extended: true` allows rich objects & arrays via querystring library
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

// Enable response compression to reduce payload size and improve performance
app.use(
  compression({
    threshold: 1024, // only compress responses larger than 1KB
  }),
);

// Use helmet to enhance security by setting various HTTP headers
app.use(helmet());

// Apply rate limiting middleware to prevent excessive request and enhance security
app.use(limiter);

(async () => {
  try {
    await connectToDatabase();

    app.use('/api/v1', v1Routes);

    app.listen(config.PORT, () => {
      console.log(`Server running on: http://localhost:${config.PORT}`);
    });
  } catch (error) {
    console.log('Failed to start the server', error);

    if (config.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
})();

/**
 * Handles server shutdown gracefully by disconnecting from the database.
 *
 * - Attempts to disconnect from the database before shutting down the server.
 * - Logs a success message if the disconnection is successful.
 * - If an error occurs during disconnection, it is logged to the console.
 * - Exits the process with status code `0` (indicating a successful shutdown).
 */
const handleServerShutdown = async () => {
  try {
    await disconnectFromDatabase();

    console.log('Server SHUTDOWN');
    process.exit(0);
  } catch (error) {
    console.log('Error during server shudown', error);
  }
};

/**
 * Listens for termination signals (`SIGTERM` and `SIGINT`)
 *
 * - `SIGTERM` is typically sent when stopping a process (e.g. `kill` command or container shutdown).
 * - `SIGINT` is triggered when the user interrupts the process (e.g. pressing Ctrl+C).
 * - When either signal is received, the `handleServerShutdown` is executed to ensure proper cleanup.
 */
process.on('SIGTERM', handleServerShutdown);
process.on('SIGINT', handleServerShutdown);
