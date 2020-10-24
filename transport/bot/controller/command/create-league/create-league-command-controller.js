'use strict';

const { Controller } = require('../../../../../lib/controller');

class CreateLeagueCommandController extends Controller {

    constructor(options) {
        super(options);

        this._leagueService = options.leagueService;
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
            request.reply('Please, sent a name for a league. Use /createleague [name] command.');

            return;
        }

        this.log(ctx, 'Creating a league.', { userId })

        const league = await this._leagueService.create(ctx, { userId, name });

        const { secret } = league;

        request.reply(`A league is created. League name is ${name}. League secret is ${secret}.`);

        this.log(ctx, 'A league is created.', { userId, league });
    }
}

module.exports = CreateLeagueCommandController;
