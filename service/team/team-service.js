'use strict';

const { Logable } = require('../../lib/log');
const { TeamModel } = require('../../model');

/** @typedef {import('../../lib/controller/controller').LoggingContext} LoggingContext */
/** @typedef {import('../../model/manager/manager-model').ManagerId} ManagerId */
/** @typedef {import('../../model/team/team-model').TeamId} TeamId */
/** @typedef {import('../../model/team/team-model').TeamData} TeamData */

class TeamService extends Logable {
    
    constructor(options) {
        super(options);

        this._teamModel = new TeamModel({
            ...options,
            config: {
                collection: 'teams'
            },
        });
    }

    /**
     * Gets a team by managerId.
     * @param {LoggingContext} ctx -
     * @param {Object} options -
     * @param {ManagerId} options.managerId -
     * @returns {Promise<TeamData>} -
     */
    async getByOwner(ctx, { managerId }) {
        this.logDebug(ctx, 'Getting a team by a manager', { managerId });

        const team = await this._teamModel.load(ctx, { managerId });

        if (!team) {
            this.logDebug(ctx, 'Unable to get a team by a manager.', { managerId });

            return null;
        }

        this.logDebug(ctx, 'A team is got by a manager.', { team });

        return team;
    }

    /**
     * Gets a team by teamId.
     * @param {LoggingContext} ctx -
     * @param {Object} options -
     * @param {TeamId} options.teamId -
     * @returns {Promise<TeamData>} -
     */
    async getByTeamId(ctx, { teamId }) {
        this.logDebug(ctx, 'Getting a team by teamId', { teamId });

        const team = await this._teamModel.load(ctx, { teamId });

        if (!team) {
            this.logDebug(ctx, 'Unable to get a team by teamId.', { teamId });

            return null;
        }

        this.logDebug(ctx, 'A team is got by teamId.', { team });

        return team;
    }

    /**
     * Gets a team by a secret.
     * @param {LoggingContext} ctx -
     * @param {{secret: string}} options -
     * @returns {Promise<TeamData>} - 
     */
    async getBySecret(ctx, { secret }) {
        this.logDebug(ctx, 'Getting a team by secret', { secret });

        const team = await this._teamModel.load(ctx, { secret });

        if (!team) {
            this.logDebug(ctx, 'Unable to get a team by secret.', { secret });

            return null;
        }

        this.logDebug(ctx, 'A team is got by secret.', { team });

        return team;
    }

    /**
     * @param {LoggingContext} ctx -
     * @param {Object} options -
     * @param {string} options.name -
     * @param {ManagerId} options.managerId -
     * @returns {Promise<TeamData>} -
     */
    async create(ctx, { name, managerId }) {
        try {
            this.logDebug(ctx, 'Creating a team for a manager.', { name, managerId });
    
            const team = await this._teamModel.create(ctx, { name, managerId });
    
            this.logDebug(ctx, 'A team is created from a manager.', { team });
    
            return team;
        } catch (error) {
            this.logError(ctx, 'Error on creating a team for a manager.', { error });

            throw error;
        }
    }
}

module.exports = TeamService;
