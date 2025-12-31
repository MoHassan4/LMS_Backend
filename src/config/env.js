import dotenv from 'dotenv';
dotenv.config();

const env = {
  port: process.env.PORT || 8000,
  databaseUrl: process.env.DATABASE_URL,
  nodeEnv: process.env.NODE_ENV || 'development',
};

export default env;
