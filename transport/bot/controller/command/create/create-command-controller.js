'use strict';

const { Controller } = require('../../../../../lib/controller');

class CreateCommandController extends Controller {

    constructor(options) {
        super(options);

        this._command = '/create';
        this._leagueService = options.leagueService;
        this._managerService = options.managerService;
    }

    async process(ctx, { request }) {
        const {
            state: {
                manager,
            },
            message: {
                text,
            },
        } = request;

        const {
            userId,
        } = manager;

        const name = text.substr(this._command.length + 1);

        if (!name) {
            request.reply('Please, sent a name for a league. Use /create [name] command.');

            return;
        }

        this.log(ctx, 'Creating a league.', { userId })

        const league = await this._leagueService.create(ctx, { userId, name });

        const secret = await this._leagueService.getSecret(ctx, { league });

        await this._managerService.joinLeague(ctx, { userId, secret });

        request.reply('A league is created. League name is '+ name +'. League secret is ' + secret + '.');

        this.log(ctx, 'A league is created.', { secret });
    }
}

module.exports = CreateCommandController;
