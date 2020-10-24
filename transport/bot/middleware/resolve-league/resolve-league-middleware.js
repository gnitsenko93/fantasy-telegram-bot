'use strict';

const { Controller } = require('../../../../lib/controller');

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

    async process(ctx, { request }) {
        const {
            manager,
        } = request.state;

        const {
            userId,
        } = manager;

        this.logDebug(ctx, 'Resolving a league.', { userId });

        const league = await this._leagueService.getByUserId(ctx, { userId });

        if (!league) {
            this.logWarn(ctx, 'Unable to resolve a league. A manager has not joined a league yet.', { userId });

            return;
        }
        
        const { leagueId } = league;

        this.logDebug(ctx, 'A league is resolved.', { userId, leagueId });

        request.state.league = league;
    }
}

module.exports = ResolveLeagueMiddleware;
