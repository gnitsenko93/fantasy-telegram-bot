'use strict';

const { Logable } = require('../../lib/log');

class ManagerModel extends Logable {

    constructor(options) {
        super(options);

        const {
            collection = 'managers',
        } = options.config;

        this._collection = collection;

        this._storage = options.storage;
    }

    async load(ctx, options) {
        try {
            const { userId } = options;
    
            this.logDebug(ctx, 'Loading a manager.', { userId });
    
            const manager = await this._storage.get(ctx, { 
                query: { userId }, collection: this._collection, 
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

    async create(ctx, options) {
        try {
            const {
                name, userId,
            } = options;

            this.logDebug(ctx, 'Creating a manager.', { ...options });
    
            const value = {
                name,
                userId,
            };
    
            const manager = await this._storage.set(ctx, { 
                value, collection: this._collection,
            });

            this.logDebug(ctx, 'A manager is created.', { manager: value });
    
            return value;
        } catch (error) {
            this.logError(ctx, 'Error on creating a manager.', { error });
            throw error;
        }
    }

    async patch(ctx, options) {
        try {
            const {
                userId,
                patch,
            } = options;
    
            this.logDebug(ctx, 'Updating a manager.', { ...options });
    
            await this._storage.update(ctx, {
                patch, query: { userId }, collection: this._collection,
            });
    
            this.logDebug(ctx, 'A manager is updated.');
    
            return;
        } catch (error) {
            this.logError(ctx, 'Error on updating a manager.', { error });
            throw error;
        }
    }
}

module.exports = ManagerModel;