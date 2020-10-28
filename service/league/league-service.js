'use strict';

const Logable = require('../../lib/log/logable');

const { LeagueModel } = require('../../model/index');

/** @typedef {import('../../lib/controller/controller').LoggingContext} LoggingContext */
/** @typedef {import('../../model/league/league-model').LeagueData} LeagueData */
/** @typedef {import('../../model/league/league-model').LeagueId} LeagueId */
/** @typedef {import('../../model/manager/manager-model').ManagerId} ManagerId */

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

    async getByManager(ctx, { managerId }) {
        const league = await this._leagueModel.load(ctx, { managerId });

        if (!league) return null;

        return league;
    }

    /**
     * Creates a league.
     * @param {LoggingContext} ctx -
     * @param {Object} options -
     * @param {ManagerId} options.managerId -
     * @param {string} options.name -
     * @returns {Promise<LeagueData>} - 
     */
    async create(ctx, { managerId, name }) {
        try {
            this.logDebug(ctx, 'Creating a league.', { managerId, name });

            const league = await this._leagueModel.create(ctx, { managerId, name });

            this.logDebug(ctx, 'A league is created.', { league });
    
            return league;
        } catch (error) {
            this.logError(ctx, 'Error on creating a league.', { error });

            throw error;
        }
    }

    /**
     * Joins a manager to a league.
     * @param {LoggingContext} ctx -
     * @param {{managerId: ManagerId, leagueId: LeagueId}} options -
     * @returns {Promise<void>} - 
     */
    async joinManager(ctx, { managerId, leagueId }) {
        try {
            this.logDebug(ctx, 'Joining a manager to a league.', { managerId, leagueId });

            await this._leagueModel.addUser(ctx, { leagueId, managerId });

            this.logDebug(ctx, 'A manager is joined to a league.', { managerId, leagueId });

            return;
        } catch (error) {
            this.logError(ctx, 'Error on joining a manager to a league.', { error });

            throw error;
        }
    }

    /**
     * Removes a manager from a league.
     * @param {LoggingContext} ctx -
     * @param {{managerId: ManagerId, leagueId: LeagueId}} options -
     * @returns {Promise<void>} - 
     */
    async removeFromLeague(ctx, { managerId, leagueId }) {
        try {
            this.logDebug(ctx, 'Removing a manager from a league.', { managerId, leagueId });

            await this._leagueModel.removeUser(ctx, { leagueId, managerId });

            this.logDebug(ctx, 'A manager is removed from a league.', { managerId, leagueId });

            return;
        } catch (error) {
            this.logError(ctx, 'Error on removing a manager from a league.', { error });

            throw error;
        }
    }
}

module.exports = LeagueService;
