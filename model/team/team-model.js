'use strict';

const Model = require('../../lib/model');

/** @typedef {import('../../lib/controller/controller').LoggingContext} LoggingContext */
/** @typedef {import('mongodb').ObjectID} TeamId */
/** @typedef {import('../manager/manager-model').ManagerId} ManagerId */
/**
 * @typedef {Object} TeamData
 * @property {TeamId} _id
 * @property {string} name -
 * @property {ManagerId} ownerId -
 */

class TeamModel extends Model {

    /**
     * Loads a team from a storage.
     * @param {LoggingContext} ctx -
     * @param {Object} options -
     * @param {TeamId} [options.teamId] -
     * @param {number} [options.secret] -
     * @param {ManagerId} [options.managerId] -
     * @returns {Promise<TeamData>} -
     */
    async load(ctx, options) {
        try {
            const { teamId, secret, managerId } = options;
    
            this.logDebug(ctx, 'Loading a team.', { teamId, secret, managerId });

            const query = { 
                _id: teamId,
                ownerId: managerId,
                secret,
            };
    
            const team = await this._storage.get(ctx, { 
                query, collection: this._collection, 
            });
    
            if (!team) { 
                this.logWarn(ctx, 'A team is not found.', { teamId, secret });
            
                return null; 
            } 

            const teamData = { teamId: team._id, ...team };
    
            this.logDebug(ctx, 'A team is loaded.', teamData);
    
            return teamData;
        } catch (error) {
            this.logError(ctx, 'Error on loading a team.', { error });
            throw error;
        }
    }

    /**
     * Creates a team in a storage.
     * @param {LoggingContext} ctx -
     * @param {Object} options -
     * @param {string} options.name -
     * @param {ManagerId} options.managerId -
     * @returns {Promise<TeamData>} -
     */
    async create(ctx, { name, managerId }) {
        try {
            const value = { name, ownerId: managerId };

            this.logDebug(ctx, 'Creating a team.', { ...value });
    
            const team = await this._storage.set(ctx, { 
                value, collection: this._collection,
            });

            this.logDebug(ctx, 'A team is created.', { team });
    
            return team;
        } catch (error) {
            this.logError(ctx, 'Error on creating a team.', { error });
            throw error;
        }
    }
}

module.exports = TeamModel;