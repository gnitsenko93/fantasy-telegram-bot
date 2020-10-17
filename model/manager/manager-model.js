'use strict';

const uuid = require('uuid').v4;

const Model = require('../../lib/model');

/** @typedef {import('../../lib/controller/controller').LoggingContext} LoggingContext */
/** @typedef {import('../../service/manager/manager-service').ManagerData} ManagerData */

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

            let query = {};

            if (secret) { 
                query.secret = secret; 
            } else {
                query.userId = userId;
            }
    
            const manager = await this._storage.get(ctx, { 
                query, collection: this._collection, 
            });
    
            if (!manager) { 
                this.logWarn(ctx, 'A manager is not found.');
            
                return null; 
            } 
    
            this.logDebug(ctx, 'A manager is loaded.', { userId: manager.userId, manager });
    
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

            const { userId } = manager;

            this.logDebug(ctx, 'A manager is created.', { userId, ...manager });
    
            return manager;
        } catch (error) {
            this.logError(ctx, 'Error on creating a manager.', { error });
            throw error;
        }
    }

    /**
     * @param {LoggingContext} ctx -
     * @param {{ user: ManagerData }} options -
     * @returns {Promise<ManagerData>} -
     */
    async patch(ctx, options) {
        try {
            const {
                user
            } = options;

            const { userId, secret } = user;
    
            this.logDebug(ctx, 'Updating a manager.', { userId, patch: user });

            let query = {};

            if (secret) { 
                query.secret = secret; 
            } else {
                query.userId = userId;
            }
            
            await this._storage.update(ctx, {
                patch: user, query, collection: this._collection,
            });
    
            this.logDebug(ctx, 'A manager is updated.', { userId });
    
            return;
        } catch (error) {
            this.logError(ctx, 'Error on updating a manager.', { error });
            throw error;
        }
    }
}

module.exports = ManagerModel;