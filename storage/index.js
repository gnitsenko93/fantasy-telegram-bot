'use strict';

const MongoStorage = require('./mongo/mongo-storage');
const RedisStorage = require('./redis/redis-storage');

module.exports = {
    MongoStorage,
    RedisStorage,
};
