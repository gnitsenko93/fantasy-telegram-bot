'use strict';

const { Controller } = require('../../../../../lib/controller');

class CreateLeagueCommandController extends Controller {

    constructor(options) {
        super(options);

        this._leagueService = options.leagueService;
        this._managerService = options.managerService;
    }

    async process(ctx, { request }) {
        const {
            state: {
                manager,
            },
        } = request;

        const {
            userId,
        } = manager;

        const name = this._getText(ctx, { request });

        if (!name) {
            request.reply('Please, sent a name for a league. Use /create-league [name] command.');

            return;
        }

        this.log(ctx, 'Creating a league.', { userId })

        const league = await this._leagueService.create(ctx, { userId, name });

        const secret = await this._leagueService.getSecret(ctx, { league });

        const { leagueId } = league;

        await this._managerService.joinLeague(ctx, { userId, leagueId });

        request.reply('A league is created. League name is '+ name +'. League secret is ' + secret + '.');

        this.log(ctx, 'A league is created.', { secret });
    }
}

module.exports = CreateLeagueCommandController;
