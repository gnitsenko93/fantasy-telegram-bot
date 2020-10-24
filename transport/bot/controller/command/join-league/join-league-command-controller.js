'use strict';

const { Controller } = require('../../../../../lib/controller');

class JoinCommandController extends Controller {

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

        if (league) {
            const { name } = league;

            request.reply(`You are already in ${name} league. To leave a league use /leaveleague command.`);

            return;
        }

        this.log(ctx, 'Joining a user to a league.', { userId });

        const secret = this._getText(ctx, { request });

        if (!secret) {
            this.logWarn(ctx, 'Unable to join a user to a league without a secret.', { userId });
            request.reply('Please, sent a league secret. Use /joinleague [secret] command.');

            return;
        }

        this.log(ctx, 'Joining a user to a league.', { userId, secret })

        const userLeague = await this._leagueService.getBySecret(ctx, { secret });

        if (!userLeague) {
            this.logWarn(ctx, 'Unable to join a user to a league with invalid secret.', { userId });

            request.reply(`A league with secret ${secret} is not found.`);
            request.reply('Create a league with /createleague [name] command or use another secret.');
            
            return;
        }

        const { leagueId, name } = userLeague;

        await this._leagueService.joinManager(ctx, {
            userId,
            leagueId,
        });

        request.reply(`You have joined a league [${name}].`);

        this.log(ctx, 'A user is joined to a league.', { userId, leagueId });
    }
}

module.exports = JoinCommandController;
