'use strict';

const Logable = require('../../lib/log/logable');

const { LeagueModel } = require('../../model/index');

/** @typedef {import('../../lib/controller/controller').LoggingContext} LoggingContext */
/** @typedef {import('../../model/league/league-model').LeagueData} LeagueData */

class LeagueService extends Logable {

    constructor(options) {
        super(options);

        this._leagueModel = new LeagueModel({
            ...options,
            config: {
                collection: 'leagues'
            },
        });
    }

    async getByLeagueId(ctx, { leagueId }) {
        const league = await this._leagueModel.load(ctx, { leagueId });

        if (!league) return null;

        return league;
    }

    async getBySecret(ctx, { secret }) {
        const league = await this._leagueModel.load(ctx, { secret });

        if (!league) return null;

        return league;
    }

    async getByUserId(ctx, { userId }) {
        const league = await this._leagueModel.load(ctx, { userId });

        if (!league) return null;

        return league;
    }

    /**
     * Creates a league.
     * @param {LoggingContext} ctx -
     * @param {Object} options -
     * @param {number} options.userId -
     * @param {string} options.name -
     * @returns {Promise<LeagueData>} - 
     */
    async create(ctx, { userId, name }) {
        try {
            this.logDebug(ctx, 'Creating a league.', { userId, name });

            const league = await this._leagueModel.create(ctx, { userId, name });

            this.logDebug(ctx, 'A league is created.', { league });
    
            return league;
        } catch (error) {
            this.logError(ctx, 'Error on creating a league.', { error });

            throw error;
        }
    }

    async joinManager(ctx, { userId, leagueId }) {
        try {
            this.logDebug(ctx, 'Joining a manager to a league.', { userId, leagueId });

            await this._leagueModel.addUser(ctx, { leagueId, userId });

            this.logDebug(ctx, 'A manager is joined to a league.');

            return;
        } catch (error) {
            this.logError(ctx, 'Error on joining a manager to a league.', { error });

            throw error;
        }
    }

    async removeFromLeague(ctx, { userId, leagueId }) {
        try {
            this.logDebug(ctx, 'Removing a manager from a league.', { userId, leagueId });

            await this._leagueModel.removeUser(ctx, { leagueId, userId });

            this.logDebug(ctx, 'A manager is removed from a league.');

            return;
        } catch (error) {
            this.logError(ctx, 'Error on removing a manager from a league.', { error });

            throw error;
        }
    }
}

module.exports = LeagueService;
