'use strict';

const { Logable } = require('../../lib/log');
const { TeamModel } = require('../../model');

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
     * @param {LoggingContext} ctx -
     * @param {Object} options -
     * @param {string} options.teamId -
     * @returns {Promise<TeamData|null>} -
     */
    async getByTeamId(ctx, { teamId }) {
        this.logDebug(ctx, 'Getting a team by teamId', { teamId });

        const team = await this._teamModel.load(ctx, { teamId });

        if (!team) {
            this.logDebug(ctx, 'Unable to get a team by teamId.', { teamId });

            return null;
        }

        this.logDebug(ctx, 'A team is got by teamId.', { teamId, team });

        return team;
    }

    async getByUserId(ctx, { userId }) {
        this.logDebug(ctx, 'Getting a team by userId', { userId });

        const team = await this._teamModel.load(ctx, { userId });

        if (!team) {
            this.logDebug(ctx, 'Unable to get a team by userId.', { userId });

            return null;
        }

        this.logDebug(ctx, 'A team is got by userId.', { userId, team });

        return team;
    }

    /**
     * @param {LoggingContext} ctx -
     * @param {Object} options -
     * @param {number} options.userId -
     * @param {string} options.name -
     * @returns {Promise<TeamData>} -
     */
    async create(ctx, { userId, name }) {
        this.logDebug(ctx, 'Creating a team for a user.', { userId, name });

        const team = await this._teamModel.create(ctx, { userId, name });

        this.logDebug(ctx, 'A team is created from a user.', { userId, team });

        return team;
    }
}

module.exports = TeamService;
