'use strict';

const Logable = require('../../lib/log/logable');

const { ManagerModel } = require('../../model/index');

/** @typedef {import('../../lib/controller/controller').LoggingContext} LoggingContext */
/**
 * @typedef {Object} ManagerData
 * @property {number} userId -
 * @property {string} firstName -
 * @property {string} lastName -
 * @property {string} username -
 * @property {string} [secret] -
 * @property {string} leagueId -
 */

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

        this.logDebug(ctx, 'A manager is got by userId.', { userId });

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

        this.logDebug(ctx, 'Getting a manager by secret', { secret });

        const manager = await this._managerModel.load(ctx, { secret });

        if (!manager) {
            this.logDebug(ctx, 'Unable to get a manager by secret.', { secret });

            return null;
        }

        const { userId } = manager;

        this.logDebug(ctx, 'A manager is got by secret.', { userId, secret });

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
     * @param {ManagerData} options.user -
     * @returns {Promise<void>} -
     */
    async update(ctx, options) {
        const { user } = options;

        await this._managerModel.patch(ctx, { user });
    }

    getLeagueId(ctx, options) {
        const {
            manager,
        } = options;

        return manager.leagueId;
    }

    hasLeague(ctx, options) {
        const {
            manager,
        } = options;

        return !!manager.leagueId;
    }

    async joinLeague(ctx, options) {
        const {
            userId,
            leagueId
        } = options;

        await this._managerModel.patch(ctx, { user: { userId, leagueId, }});
    }

    async leaveLeague(ctx, options) {
        const { userId } = options;

        await this._managerModel.patch(ctx, { user: { userId, leagueId: null } });
    }
}

module.exports = ManagerService;