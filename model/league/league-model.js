'use strict';

const { generate: uuid } = require('short-uuid');

const Model = require('../../lib/model');

/** @typedef {import('../../lib/controller/controller').LoggingContext} LoggingContext */
/** @typedef {import('../../model/manager/manager-model').ManagerId} ManagerId */
/** @typedef {import('mongodb').ObjectID} LeagueId */
/**
 * @typedef {Object} LeagueData
 * @property {LeagueId} _id -
 * @property {string} secret -
 * @property {string} name -
 * @property {ManagerId} ownerId -
 * @property {ManagerId[]} managers -
 */

class LeagueModel extends Model {

    /**
     * Loads a league from a database.
     * @param {LoggingContext} ctx -
     * @param {Object} options -
     * @param {ManagerId} [options.managerId] -
     * @param {LeagueId} [options.leagueId] -
     * @param {string} [options.secret] -
     * @returns {Promise<LeagueData>} - 
     */
    async load(ctx, options) {
        try {
            const { 
                secret, 
                leagueId,
                managerId,
            } = options;

            this.logDebug(ctx, 'Loading a league from a storage.', options);

            const query = {
                _id: leagueId,
                secret,
            };

            if (managerId) {
                query.managers = [managerId];
            }

            const league = await this._storage.get(ctx, { 
                query, collection: this._collection,
            });

            if (!league) {
                this.logWarn(ctx, 'A league is not found in a storage.', { secret, leagueId });

                return null;
            }

            this.logDebug(ctx, 'A league is loaded from a storage.', { league });

            return league;
        } catch (error) {
            this.logError(ctx, 'Error on loading a league from a storage.', { error });
            throw error;
        }
    }

    /**
     * Creates a league in a database.
     * @param {LoggingContext} ctx -
     * @param {Object} options -
     * @param {ManagerId} options.managerId -
     * @param {string} options.name -
     * @returns {Promise<LeagueData>} - 
     */
    async create(ctx, options) {
        const { managerId, name } = options;

        const secret = uuid();

        this.logDebug(ctx, 'Creating a league in a storage.', { managerId, name, secret });

        try {
            const league = await this._storage.set(ctx, {
                value: { 
                    name,
                    ownerId: managerId,
                    secret,
                    managers: [],
                }, 
                collection: this._collection,
            });

            this.logDebug(ctx, 'A league is created in a storage.', { league })

            return league;
        } catch (error) {
            this.logError(ctx, 'Error on creating a league in storage.', { error });

            throw error;
        }
    }

    /**
     * Inserts a manager to league managers.
     * @param {LoggingContext} ctx -
     * @param {Object} options -
     * @param {ManagerId} options.managerId -
     * @param {LeagueId} options.leagueId -
     * @returns {Promise<void>} -
     */
    async addUser(ctx, { managerId, leagueId }) {
        try {
            this.logDebug(ctx, 'Inserting a manager to league managers in a storage.', { managerId, leagueId });

            await this._storage.pushToArray(ctx, {
                query: { _id: leagueId },
                field: 'managers',
                value: managerId,
                collection: this._collection
            });

            this.logDebug(ctx, 'A manager is inserted to league managers in a storage.', { managerId, leagueId });
        } catch (error) {
            this.logError(ctx, 'Error on inserting a manager to league managers in a storage.', { error });

            throw error;
        }
    }

    /**
     * Removes a manager from league managers.
     * @param {LoggingContext} ctx -
     * @param {Object} options -
     * @param {ManagerId} options.managerId -
     * @param {LeagueId} options.leagueId -
     * @returns {Promise<void>} -
     */
    async removeUser(ctx, { managerId, leagueId }) {
        try {
            this.logDebug(ctx, 'Removing a manager from league managers in a storage.', { managerId, leagueId });

            await this._storage.pullFromArray(ctx, {
                query: { _id: leagueId },
                field: 'managers',
                value: managerId,
                collection: this._collection
            });

            this.logDebug(ctx, 'A manager is removed from league managers in a storage.');
        } catch (error) {
            this.logError(ctx, 'Error on removing a manager from league managers in a storage.', { error });

            throw error;
        }
    }
}

module.exports = LeagueModel;