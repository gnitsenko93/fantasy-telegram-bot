'use strict';

const { generate: uuid } = require('short-uuid');

const Model = require('../../lib/model');

/** @typedef {import('../../lib/controller/controller').LoggingContext} LoggingContext */
/** @typedef {import('mongodb').ObjectID} ManagerId */
/**
 * @typedef {Object} ManagerData
 * @property {ManagerId} _id -
 * @property {number} userId -
 * @property {string} firstName -
 * @property {string} lastName -
 * @property {string} username -
 * @property {string} [secret] -
 */

class ManagerModel extends Model {

    /**
     * @param {LoggingContext} ctx -
     * @param {Object} options -
     * @param {number} [options.userId] -
     * @param {string} [options.secret] -
     * @returns {Promise<ManagerData>} -
     */
    async load(ctx, options) {
        try {
            const { userId, secret } = options;
    
            this.logDebug(ctx, 'Loading a manager.', { userId, secret });

            const query = {
                secret,
                userId,
            };
    
            const manager = await this._storage.get(ctx, { 
                query, collection: this._collection, 
            });
    
            if (!manager) { 
                this.logWarn(ctx, 'A manager is not found.');
            
                return null; 
            } 
    
            this.logDebug(ctx, 'A manager is loaded.', { manager });
    
            return manager;
        } catch (error) {
            this.logError(ctx, 'Error on loading a manager.', { error });
            throw error;
        }
    }

    /**
     * @param {LoggingContext} ctx -
     * @param {{ user: ManagerData }} options -
     * @returns {Promise<ManagerData>} -
     */
    async create(ctx, options) {
        try {
            const { user } = options;

            const secret = uuid();

            const value = { secret, ...user };

            this.logDebug(ctx, 'Creating a manager.', { ...value });
    
            const manager = await this._storage.set(ctx, { 
                value, collection: this._collection,
            });

            this.logDebug(ctx, 'A manager is created.', { manager });
    
            return manager;
        } catch (error) {
            this.logError(ctx, 'Error on creating a manager.', { error });
            throw error;
        }
    }

    /**
     * @param {LoggingContext} ctx -
     * @param {{ managerId: ManagerId, update: ManagerData }} options -
     * @returns {Promise<ManagerData>} -
     */
    async patch(ctx, options) {
        try {
            const {
                managerId,
                update
            } = options;
    
            this.logDebug(ctx, 'Updating a manager.', { managerId, update });
            
            await this._storage.update(ctx, {
                query: { _id: managerId },
                patch: update,
                collection: this._collection,
            });
    
            this.logDebug(ctx, 'A manager is updated.', { managerId });
    
            return;
        } catch (error) {
            this.logError(ctx, 'Error on updating a manager.', { error });
            throw error;
        }
    }
}

module.exports = ManagerModel;