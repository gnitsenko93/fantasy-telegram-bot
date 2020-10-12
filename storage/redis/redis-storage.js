'use strict';

const Redis = require('ioredis');
const URL = require('url');

const { Logable } = require('../../lib/log');

class RedisStorage extends Logable {

    constructor(options) {
        super(options);

        const {
            url,
            options: {
                lazyConnect = true,
            }
        } = options.config;

        const { hostname, port } = URL.parse(url);

        this._host = hostname;
        this._port = Number(port);
        this._client = new Redis({
            port: this._port,
            host: this._host,
            lazyConnect: lazyConnect,
        });
    }

    async start(ctx) {
        try {
            const options = {
                host: this._host,
                port: this._port,
            };
    
            this.log(ctx, 'Connecting to Redis.', options)
            await this._client.connect();
            this.log(ctx, 'Connected to Redis.', options);
        } catch (error) {
            this.logError(ctx, 'Error on connecting to Redis.', { error });
            throw error;
        }
    }

    async stop(ctx) {
        try {
            this.log(ctx, 'Disconnecting from Redis.');
            await this._client.disconnect();
            this.log(ctx, 'Disconnected from Redis.');
        } catch (error) {
            this.logError(ctx, 'Error on disconnecting from Redis.', { error });
            throw error;
        }
    }

    async get(ctx, options) {
        try {
            const {
                key,
            } = options;

            this.logDebug(ctx, 'Obtaining a value from Redis.', { key });

            const result = await this._client.get(key);

            this.logDebug(ctx, 'A value is obtained from Redis.', { value: result });

            const value = JSON.parse(result);

            return value;
        } catch (error) {
            this.logError(ctx, 'Error on obtaining a value from Redis.', { error });
            throw error;
        }
    }

    async set(ctx, options) {
        try {
            const {
                key,
                value,
            } = options;

            this.logDebug(ctx, 'Setting a value in Redis.', { key, value });

            await this._client.set(key, JSON.stringify(value));

            this.logDebug(ctx, 'A value is set in Redis.', { key, value });

            return;
        } catch (error) {
            this.logError(ctx, 'Error on setting a value in Redis.', { error });
            throw error;
        }
    }

    async update(ctx, options) {
        throw new Error('update method of RedisStorage is not implemented');
    }
}

module.exports = RedisStorage;
