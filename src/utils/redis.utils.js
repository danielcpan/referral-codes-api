const httpStatus = require('http-status');
const redis = require('redis').createClient();
const { promisify } = require('util');
const config = require('../../config/config');

const getAsync = promisify(redis.get).bind(redis);

const buildKey = (req) => req.originalUrl.replace('/api/', '').replace('/', ':');

const connectRedis = () => {
  redis.on('connect', () => console.log('Redis Connection Succesful'));
  redis.on('error', (err) => console.log(`Redis Connection Error ${err}`));
};

const checkCache = async (req, res, next) => {
  if (config.ENV === 'test') return next();

  const key = buildKey(req);

  try {
    const cachedData = await getAsync(key);

    if (!cachedData) {
      if (config.ENV === 'development') console.log('NO CACHED DATA');
      return next();
    }

    if (config.ENV === 'development') console.log('WE GOT CACHED DATA FROM REDIS');

    return res.status(httpStatus.OK).json(JSON.parse(cachedData));
  } catch (err) {
    if (config.ENV === 'development') console.log(`REDIS ERROR ${err}`);
    return next();
  }
};

const addToCache = (req, expirationTime = 300, value) => {
  if (config.ENV === 'test') return;

  const key = buildKey(req);

  if (config.ENV === 'development') {
    redis.setex(key, 15, JSON.stringify(value));
  } else {
    redis.setex(key, expirationTime, JSON.stringify(value));
  }
};

module.exports = {
  buildKey,
  connectRedis,
  checkCache,
  addToCache,
  redis,
};
