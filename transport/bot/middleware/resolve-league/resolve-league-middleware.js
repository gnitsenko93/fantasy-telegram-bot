'use strict';

const { Controller } = require('../../../../lib/controller');

/** @typedef {import('../../../../lib/controller/controller').RequestOptions} RequestOptions */
/** @typedef {import('../../../../lib/controller/controller').LoggingContext} LoggingContext */
/** @typedef {import('../../../../lib/controller/controller').Options} ControllerOptions */
/** @typedef {{ leagueService: import('../../../../service/league/league-service')} & ControllerOptions} Options */

class ResolveLeagueMiddleware extends Controller {

    /**
     * @constructor
     * @param {Options} options -
     */
    constructor(options) {
        super(options);

        this._leagueService = options.leagueService;
    }

    /**
     * @param {LoggingContext} ctx -
     * @param {RequestOptions} options -
     * @returns {Promise<void>} -
     */
    async process(ctx, { request }) {
        const {
            manager,
        } = request.state;

        if (!manager) {
            this.logWarn(ctx, 'Unable to resolve a league without a manager.');

            return;
        }

        const {
            _id: managerId,
        } = manager;

        this.logDebug(ctx, 'Resolving a league.', { managerId });

        const league = await this._leagueService.getByManager(ctx, { managerId });

        if (!league) {
            this.logWarn(ctx, 'Unable to resolve a league. A manager has not joined a league yet.', { managerId });

            return;
        }
        
        this.logDebug(ctx, 'A league is resolved.', { league });

        request.state.league = league;
    }
}

module.exports = ResolveLeagueMiddleware;
