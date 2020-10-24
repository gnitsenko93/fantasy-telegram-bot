'use strict';

const uuid = require('uuid').v4;

const Model = require('../../lib/model');

/** @typedef {import('../../lib/controller/controller').LoggingContext} LoggingContext */
/** @typedef {import('../../service/team/team-service').TeamData} TeamData */

class TeamModel extends Model {

    /**
     * Loads a team from a storage.
     * @param {LoggingContext} ctx -
     * @param {Object} options -
     * @param {string} [options.teamId] -
     * @param {number} [options.userId] -
     * @returns {Promise<TeamData>} -
     */
    async load(ctx, options) {
        try {
            const { teamId, userId } = options;
    
            this.logDebug(ctx, 'Loading a team.', { teamId, userId });

            const query = { 
                _id: teamId, 
                userId,
            };
    
            const team = await this._storage.get(ctx, { 
                query, collection: this._collection, 
            });
    
            if (!team) { 
                this.logWarn(ctx, 'A team is not found.', { teamId, userId });
            
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
     * @param {number} options.userId -
     * @param {string} options.name -
     * @returns {Promise<TeamData>} -
     */
    async create(ctx, { userId, name }) {
        try {
            const teamId = uuid();

            const value = { userId, name, teamId };

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