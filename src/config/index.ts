import dotenv from 'dotenv';

dotenv.config();

const config = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MAIN_DOCS: process.env.MAIN_DOCS,
  WHITELIST_ORIGINS: [process.env.MAIN_DOCS],
  MONGO_URI: process.env.MONGO_URI,
  LOG_LEVEL: process.env.LOG_LEVEL,
};

export default config;
