import winston from 'winston';

import config from '@/config';

const { combine, timestamp, json, errors, align, printf, colorize } =
  winston.format;

// Define the transports array to hold different logging transports
const transports: winston.transport[] = [];

// If the application is not running in production, add a console transport
if (config.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }), // add color to the output
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // add timestamp to the logs
        align(), // align the logs
        printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length
            ? `\n${JSON.stringify(meta)}`
            : '';

          return `${timestamp} [${level.toUpperCase()}]: ${message} ${metaStr}`;
        }),
      ),
    }),
  );
}

// Create a logger instance with the defined transports
const logger = winston.createLogger({
  level: config.LOG_LEVEL || 'info', // set the default log level to 'info'
  format: combine(timestamp(), errors({ stack: true }), json()), // use JSON format for log messages
  transports,
  silent: config.NODE_ENV === 'test', // disable logging in test  environment
});

export { logger };
