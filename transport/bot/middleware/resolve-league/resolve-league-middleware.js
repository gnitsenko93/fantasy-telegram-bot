'use strict';

const { Controller } = require('../../../../lib/controller');

class ResolveLeagueMiddleware extends Controller {

    constructor(options) {
        super(options);

        this._leagueService = options.leagueService;
        this._managerService = options.managerService;
    }

    async process(ctx, { request }) {
        const {
            manager
        } = request.state;

        if (!manager) {
            this.logWarn(ctx, 'Unable to resolve a league with no manager.');
            return;
        }


        if (!this._managerService.hasLeague(ctx, { manager })) {
            this.logWarn(ctx, 'A manager has not not joined a league yet.');
            return;
        }

        const secret = this._managerService.getSecret(ctx, { manager });

        const league = await this._leagueService.getBySecret(ctx, { secret });

        request.state.league = league;
    }
}

module.exports = ResolveLeagueMiddleware;
