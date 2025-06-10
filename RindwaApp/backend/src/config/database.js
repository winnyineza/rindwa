const knex = require('knex');
const { Pool } = require('pg');

// Knex configuration
const knexConfig = {
  development: {
    client: 'postgresql',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'rindwa_dev',
    },
    migrations: {
      directory: './src/database/migrations',
    },
    seeds: {
      directory: './src/database/seeds',
    },
    pool: {
      min: 2,
      max: 10,
    },
  },
  test: {
    client: 'postgresql',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'rindwa_test',
    },
    migrations: {
      directory: './src/database/migrations',
    },
    seeds: {
      directory: './src/database/seeds',
    },
    pool: {
      min: 1,
      max: 5,
    },
  },
  production: {
    client: 'postgresql',
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    },
    migrations: {
      directory: './src/database/migrations',
    },
    seeds: {
      directory: './src/database/seeds',
    },
    pool: {
      min: 5,
      max: 20,
    },
  },
};

const environment = process.env.NODE_ENV || 'development';
const config = knexConfig[environment];

// Create Knex instance
const db = knex(config);

// PostgreSQL connection pool for direct queries
const pool = new Pool({
  host: config.connection.host,
  port: config.connection.port,
  user: config.connection.user,
  password: config.connection.password,
  database: config.connection.database,
  ssl: config.connection.ssl,
  max: config.pool.max,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test database connection
async function connectDB() {
  try {
    await db.raw('SELECT 1');
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    throw error;
  }
}

// Close database connections
async function closeDB() {
  try {
    await db.destroy();
    await pool.end();
    console.log('✅ Database connections closed');
  } catch (error) {
    console.error('❌ Error closing database connections:', error.message);
    throw error;
  }
}

// Health check for database
async function healthCheck() {
  try {
    const result = await db.raw('SELECT NOW() as current_time');
    return {
      status: 'healthy',
      timestamp: result.rows[0].current_time,
      connection: 'active',
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      connection: 'inactive',
    };
  }
}

module.exports = {
  db,
  pool,
  connectDB,
  closeDB,
  healthCheck,
  knexConfig,
};
