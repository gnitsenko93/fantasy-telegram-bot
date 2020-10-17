'use strict';

const { Controller } = require('../../../../../lib/controller');

class JoinCommandController extends Controller {

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
            message: {
                text,
            },
        } = request;

        const {
            userId,
        } = manager;

        const secret = this._getText(ctx, { request });

        if (!secret) {
            this.logWarn(ctx, 'Unable to join a user to a league without a secret.');
            request.reply('Please, sent a league secret. Use /join-league [secret] command.');

            return;
        }

        if (this._managerService.hasLeague(ctx, { manager })) {
            request.reply('You have already in a league.');
            request.reply('Leave a league with /leave-league command first.');

            return;
        }

        this.log(ctx, 'Joining a user to a league.', { userId, secret })

        const league = await this._leagueService.getBySecret(ctx, { secret });

        if (!league) {
            request.reply('A league with secret ' + secret + ' is not found.');
            request.reply('Create a league with /create-league [name] command or use another secret.');
            
            return;
        }

        const { leagueId, name } = league;

        await this._managerService.joinLeague(ctx, { userId, leagueId });

        request.reply(`You have joined a league [${name}].`);

        this.log(ctx, 'A user joined to a league.', { userId, leagueId });
    }
}

module.exports = JoinCommandController;
