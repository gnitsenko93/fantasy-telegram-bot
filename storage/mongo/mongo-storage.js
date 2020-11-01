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
                db,
            },
        } = options.config;

        this._url = url;
        this._clientOptions = clientOptions;
        this._dbName = db;

        this._client = new MongoClient(this._url, this._clientOptions);
        this._db = null;
    }

    async start(ctx) {
        try {
            this.log(ctx, 'Connecting to MongoDB.', { url: this._url });
            await this._client.connect();
            this._db = this._client.db(this._dbName);
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

            const mongoQuery = this._getQuery(ctx, { query });

            this.logDebug(ctx, 'Obtaining a value from a collection.', {
                collection, query: mongoQuery,
            });

            const value = await this._db.collection(collection).findOne(mongoQuery);

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

    async getMany(ctx, options) {
        try {
            const {
                query, collection,
            } = options;

            const mongoQuery = this._getQuery(ctx, { query });

            this.logDebug(ctx, 'Obtaining multiple values from a collection.', {
                collection, query: mongoQuery,
            });

            const values = await this._db.collection(collection).find(mongoQuery).toArray();

            if (!values || !values.length) {
                this.logWarn(ctx, 'No values are found in a collection.');

                return [];
            }

            this.logDebug(ctx, 'Value are obtained from a collection.', { values });

            return values;
        } catch (error) {
            this.logError(ctx, 'Error on obtaining a value from a collection.', { error });
            throw error;
        }
    }

    _getQuery(ctx, { query }) {
        return Object.keys(query).reduce((acc, key) => {
            if (Array.isArray(query[key]) && query[key].length) {
                acc[key] = {
                    $in: query[key],
                };
            } else if (typeof query[key] !== 'undefined') {
                acc[key] = {
                    $eq: query[key],
                };
            }

            return acc;
        }, {});
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

            const { insertedId: _id } = await this._db.collection(collection).insertOne(value);

            const data = { _id, ...value };

            this.logDebug(ctx, 'A value is set in a collection.', data);

            return data;
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

    async pushToArray(ctx, options) {
        const {
            query, field, value, collection,
        } = options;

        await this._db.collection(collection).findOneAndUpdate(query, {
            $push: {
                [field]: value,
            },
        });
    }

    async pullFromArray(ctx, options) {
        const {
            query, field, value, collection,
        } = options;

        await this._db.collection(collection).findOneAndUpdate(query, {
            $pull: {
                [field]: value,
            },
        });
    }

    /**
     * Counts documents in a collection.
     * @param {LoggingContext} ctx -
     * @param {Object} options -
     * @param {Object} options.query -
     * @param {string} options.collection -
     * @returns {Promise<number>} -
     */
    async count(ctx, options) {
        const {
            query, collection,
        } = options;

        this.logDebug(ctx, 'Counting documents in a collection.', { query, collection });

        const count = await this._db.collection(collection).countDocuments(query);

        this.logDebug(ctx, 'Documents in a collection are counted.', { count });

        return count;
    }

    /**
     * 
     * @param {LoggingContext} ctx -
     * @param {Object[]} operations -
     * @param {Object} options -
     * @param {string} options.collection -
     * @returns {Promise<void>} -
     */
    async bulkUpdate(ctx, operations, { collection }) {
        this.logDebug(ctx, 'Performing a bulk write to a collection.', { operations, collection });

        const result = await this._db.collection(collection).bulkWrite(operations);

        this.logDebug(ctx, 'A bulk write to a collection is performed.', result);
    }
}

module.exports = MongoStorage;
