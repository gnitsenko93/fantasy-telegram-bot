'use strict';

const { v4: uuid } = require('uuid');

const Model = require('../../lib/model');

/** @typedef {import('../../lib/controller/controller').LoggingContext} LoggingContext */
/**
 * @typedef {Object} LeagueData
 * @property {string} leagueId -
 * @property {string} secret -
 * @property {string} name -
 * @property {number} ownerId -
 */

class LeagueModel extends Model {

    /**
     * Loads a league from a database.
     * @param {LoggingContext} ctx -
     * @param {Object} options -
     * @param {number} [options.userId] -
     * @param {string} [options.leagueId] -
     * @param {string} [options.secret] -
     * @returns {Promise<LeagueData>} - 
     */
    async load(ctx, options) {
        try {
            const { 
                secret, 
                leagueId,
                userId,
            } = options;

            this.logDebug(ctx, 'Loading a league from a storage.', options);

            const query = {};

            if (leagueId) {
                query._id = leagueId;
            }

            if (userId) {
                query.users = [userId];
            }

            if (secret) {
                query.secret = secret;
            }

            const league = await this._storage.get(ctx, { 
                query, collection: this._collection,
            });

            if (!league) {
                this.logWarn(ctx, 'A league is not found in a storage.', { secret, leagueId });

                return null;
            }

            const leagueData = { leagueId: league._id, ...league };

            this.logDebug(ctx, 'A league is loaded from a storage.', leagueData);

            return leagueData;
        } catch (error) {
            this.logError(ctx, 'Error on loading a league from a storage.', { error });
            throw error;
        }
    }

    /**
     * Creates a league in a database.
     * @param {LoggingContext} ctx -
     * @param {Object} options -
     * @param {number} options.userId -
     * @param {string} options.name -
     * @returns {Promise<LeagueData>} - 
     */
    async create(ctx, options) {
        const { userId, name } = options;

        const secret = uuid();

        this.logDebug(ctx, 'Creating a league in a storage.', { userId, name, secret });

        try {
            const league = await this._storage.set(ctx, {
                value: { 
                    name,
                    ownerId: userId,
                    secret,
                    users: [],
                }, 
                collection: this._collection,
            });

            const { _id: leagueId } = league;
            const leagueData = { leagueId, ...league };

            this.logDebug(ctx, 'A league is created in a storage.', leagueData)

            return leagueData;
        } catch (error) {
            this.logError(ctx, 'Error on creating a league in storage.', { error });

            throw error;
        }
    }

    /**
     * Inserts a user to league users.
     * @param {LoggingContext} ctx -
     * @param {Object} options -
     * @param {number} options.userId -
     * @param {string} options.leagueId -
     * @returns {Promise<void>} -
     */
    async addUser(ctx, { userId, leagueId }) {
        try {
            this.logDebug(ctx, 'Inserting a user to league users in a storage.', { userId, leagueId });

            await this._storage.pushToArray(ctx, {
                query: { _id: leagueId },
                field: 'users',
                value: userId,
                collection: this._collection
            });

            this.logDebug(ctx, 'A user is inserted to league users in a storage.');
        } catch (error) {
            this.logError(ctx, 'Error on inserting a user to league users in a storage.', { error });

            throw error;
        }
    }

    async removeUser(ctx, { userId, leagueId }) {
        try {
            this.logDebug(ctx, 'Removing a user to league users in a storage.', { userId, leagueId });

            await this._storage.pullFromArray(ctx, {
                query: { _id: leagueId },
                field: 'users',
                value: userId,
                collection: this._collection
            });

            this.logDebug(ctx, 'A user is removed from league users in a storage.');
        } catch (error) {
            this.logError(ctx, 'Error on removing a user from league users in a storage.', { error });

            throw error;
        }
    }
}

module.exports = LeagueModel;