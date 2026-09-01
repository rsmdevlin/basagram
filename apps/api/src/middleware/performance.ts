import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import Redis from 'redis';

// Compression middleware
export const compressionMiddleware = compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 9,
});

// Helmet security headers
export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});

// Rate limiting
export const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
  return rateLimit({
    windowMs,
    max,
    message: 'Слишком много запросов, попробуйте позже',
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Strict rate limiter for auth endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Слишком много попыток входа, попробуйте позже',
  skipSuccessfulRequests: true,
});

// Redis cache client
export const createCacheClient = () => {
  const client = Redis.createClient({
    socket: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    },
  });

  client.on('error', (err) => {
    console.error('Redis Client Error', err);
  });

  client.connect();

  return client;
};

// Cache middleware
export const cacheMiddleware = (duration = 300) => {
  return async (req: any, res: any, next: any) => {
    if (req.method !== 'GET') {
      return next();
    }

    const key = `cache:${req.originalUrl || req.url}`;

    try {
      const cachedData = await req.app.locals.cache.get(key);
      if (cachedData) {
        res.setHeader('X-Cache', 'HIT');
        return res.json(JSON.parse(cachedData));
      }
    } catch (error) {
      console.warn('Cache get error:', error);
    }

    const originalJson = res.json.bind(res);

    res.json = function (data: any) {
      try {
        req.app.locals.cache.setEx(key, duration, JSON.stringify(data));
      } catch (error) {
        console.warn('Cache set error:', error);
      }

      res.setHeader('X-Cache', 'MISS');
      return originalJson(data);
    };

    next();
  };
};

// Query optimization helpers
export const selectFields = (fields: string[]) => {
  return fields.join(', ');
};

export const optimizedPagination = (page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  return { limit, offset };
};

// Connection pooling configuration
export const createDatabasePool = (config: any) => {
  return {
    host: config.host || process.env.DB_HOST,
    user: config.user || process.env.DB_USER,
    password: config.password || process.env.DB_PASSWORD,
    database: config.database || process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: config.connectionLimit || 10,
    queueLimit: config.queueLimit || 0,
    enableKeepAlive: true,
    keepAliveInitialDelayMs: 0,
  };
};

// Response time middleware
export const responseTimeMiddleware = (req: any, res: any, next: any) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    if (duration > 1000) {
      console.warn(`Slow request: ${req.method} ${req.url} took ${duration}ms`);
    }
  });

  const originalJson = res.json.bind(res);
  res.json = function (data: any) {
    const duration = Date.now() - start;
    res.setHeader('X-Response-Time', `${duration}ms`);
    return originalJson(data);
  };

  next();
};

// Batch query helper
export const batchQuery = async (queries: Array<{ sql: string; params: any[] }>, db: any) => {
  return Promise.all(
    queries.map((q) => db.query(q.sql, q.params))
  );
};

// Lazy loading helper
export const lazyLoad = (data: any[], threshold = 20) => {
  return {
    items: data.slice(0, threshold),
    hasMore: data.length > threshold,
    total: data.length,
  };
};
