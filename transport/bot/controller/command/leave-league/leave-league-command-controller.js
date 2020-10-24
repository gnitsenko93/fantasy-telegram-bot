'use strict';

const { Controller } = require('../../../../../lib/controller');

class LeaveCommandController extends Controller {

    constructor(options) {
        super(options);

        this._leagueService = options.leagueService;
    }

    async process(ctx, { request }) {
        const {
            state: {
                manager,
                league,
            },
        } = request;

        const {
            userId,
        } = manager;

        if (!league) {
            request.reply('You have not joined a league yet. To join a league use /joinleague [secret] command.');

            return;
        }

        const { leagueId, name } = league;

        this.log(ctx, 'Removing a user from a league.', { userId, leagueId });

        await this._leagueService.removeFromLeague(ctx, { userId, leagueId });

        request.reply(`${name} league is left.`);

        this.log(ctx, 'A user is removed from a league.', { userId, leagueId });
    }
}

module.exports = LeaveCommandController;
