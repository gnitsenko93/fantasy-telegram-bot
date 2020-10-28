'use strict';

const Logable = require('../../lib/log/logable');

const { ManagerModel } = require('../../model/index');

/** @typedef {import('../../lib/controller/controller').LoggingContext} LoggingContext */
/** @typedef {import('../../model/manager/manager-model').ManagerId} ManagerId */
/** @typedef {import('../../model/manager/manager-model').ManagerData} ManagerData */

class ManagerService extends Logable {

    constructor(options) {
        super(options);

        this._managerModel = new ManagerModel({
            ...options,
            config: {
                collection: 'managers'
            },
        });
    }

    /**
     * Gets a manager by userId.
     * @param {LoggingContext} ctx -
     * @param {Object} options -
     * @param {number} options.userId -
     */
    async getByUserId(ctx, options) {
        const { userId } = options;

        this.logDebug(ctx, 'Getting a manager by userId', { userId });

        const manager = await this._managerModel.load(ctx, { userId });

        if (!manager) {
            this.logDebug(ctx, 'Unable to get a manager by userId.', { userId });

            return null;
        }

        this.logDebug(ctx, 'A manager is got by userId.', { manager });

        return manager;
    }

    /**
     * Gets a manager by secret.
     * @param {LoggingContext} ctx -
     * @param {Object} options -
     * @param {string} options.secret -
     * @returns {Promise<ManagerData>} -
     */
    async getBySecret(ctx, options) {
        const { secret } = options;

        this.logDebug(ctx, 'Getting a manager by a secret', { secret });

        const manager = await this._managerModel.load(ctx, { secret });

        if (!manager) {
            this.logDebug(ctx, 'Unable to get a manager by a secret.', { secret });

            return null;
        }

        this.logDebug(ctx, 'A manager is got by a secret.', { manager });

        return manager;
    }

    /**
     * Creates a manager.
     * @param {LoggingContext} ctx -
     * @param {Object} options -
     * @param {ManagerData} options.user -
     * @returns {Promise<ManagerData>} -
     */
    async create(ctx, options) {
        const { user } = options;

        const manager = await this._managerModel.create(ctx, { 
            user,
        });

        return manager;
    }

    /**
     * Updates a manager.
     * @param {LoggingContext} ctx -
     * @param {Object} options -
     * @param {ManagerId} options.managerId -
     * @param {ManagerData} options.update -
     * @returns {Promise<void>} -
     */
    async update(ctx, options) {
        const { managerId, update } = options;

        await this._managerModel.patch(ctx, { managerId, update });
    }

    async joinLeague(ctx, { userId, leagueId }) {
        this.logDebug(ctx, 'Joining a manager to a league.', { userId, leagueId });

        try {
            await this._managerModel.patch(ctx, { user: { userId, leagueId } });
        } catch (error) {
            this.logError(ctx, 'Error on joining a manager to a league.', { error });

            throw error;
        }

        this.logDebug(ctx, 'A manager is joined to a league.', { userId, leagueId });
    }

    async leaveLeague(ctx, { userId }) {
        this.logDebug(ctx, 'Unjoining a manager from a league.', { userId });

        try {
            await this._managerModel.patch(ctx, { user: { userId, leagueId: null } });
        } catch (error) {
            this.logError(ctx, 'Error on unjoining a manager from a league.', { error });

            throw error;
        }

        this.logDebug(ctx, 'A manager has left a league.', { userId });
    }
}

module.exports = ManagerService;