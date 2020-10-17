'use strict';

const { MongoClient } = require('mongodb');
const _ = require('lodash');

const { Logable } = require('../../lib/log');

/** @typedef {import('../../lib/controller/controller').LoggingContext} LoggingContext */

class MongoStorage extends Logable {

    constructor(options) {
        super(options);

        const {
            url,
            options: {
                client: clientOptions,
                db: dbOptions,
            },
        } = options.config;

        this._url = url;
        this._clientOptions = clientOptions;
        this._dbOptions = dbOptions;

        this._client = new MongoClient(this._url, this._clientOptions);
        this._db = null;
    }

    async start(ctx) {
        try {
            this.log(ctx, 'Connecting to MongoDB.', { url: this._url });
            await this._client.connect();
            this._db = this._client.db(this._dbOptions.name);
            this.log(ctx, 'Connected to MongoDB.');
        } catch (error) {
            this.logError(ctx, 'Error on connecting to MongoDB.', { error });
            throw error;
        }
    }

    async stop(ctx) {
        try {
            this.log(ctx, 'Disconnecting from MongoDB.');
            await this._client.close();
            this.log(ctx, 'Disconnected from MongoDB.');
        } catch (error) {
            this.logError(ctx, 'Error on disconnecting from MongoDB.', { error });
            throw error;
        }
    }

    async get(ctx, options) {
        try {
            const {
                query, collection,
            } = options;

            this.logDebug(ctx, 'Obtaining a value from a collection.', { ...options });

            const value = await this._db.collection(collection).findOne(query);

            if (!value) {
                this.logWarn(ctx, 'A value is not found in a collection.');

                return null;
            }

            this.logDebug(ctx, 'A value is obtained from a collection.', { value });

            return value;
        } catch (error) {
            this.logError(ctx, 'Error on obtaining a value from a collection.', { error });
            throw error;
        }
    }

    /**
     * Sets a value in a storage.
     * @param {LoggingContext} ctx -
     * @param {{ value: Object, collection: string }} options -
     * @returns {Promise<Object>} -
     */
    async set(ctx, options) {
        try {
            const {
                value, collection,
            } = options;

            this.logDebug(ctx, 'Setting a value in a collection.', { ...options });

            const data = { _id: value.id, ..._.omit(value, ['id'])};

            const result = await this._db.collection(collection).insertOne(data);

            const id = result.insertedId.toString();

            this.logDebug(ctx, 'A value is set in a collection.', { id, ...value });

            return { id, ...value };
        } catch (error) {
            this.logError(ctx, 'Error on setting a value in a collection.', { error });
            throw error;
        }
    }

    async update(ctx, options) {
        try {
            const {
                query, patch, collection,
            } = options;

            this.logDebug(ctx, 'Updating a value in a collection.', { ...options });

            await this._db.collection(collection).findOneAndUpdate(query, { $set: patch });

            this.logDebug(ctx, 'A value is updated in a collection.');

            return;
        } catch (error) {
            this.logError(ctx, 'Error on updating a value in a collection.', { error });
            throw error;
        }
    }
}

module.exports = MongoStorage;
