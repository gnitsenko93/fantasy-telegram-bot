'use strict';

const { Controller } = require('../../../../../lib/controller');

class InfoCommandController extends Controller {

    constructor(options) {
        super(options);

        this._command = '/info';
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

        this.log(ctx, 'Getting manager info.', { userId });

        const {
            name,
        } = manager;

        let reply = `Hello, ${name}!`;

        if (this._managerService.hasLeague(ctx, { manager })) {
            const secret = await this._managerService.getSecret(ctx, { manager });
            const {
                name
            } = await this._leagueService.getBySecret(ctx, { secret });

            reply = `${reply}\nYou are in a ${name} league. Your league secret is ${secret}.`;
        } else {
            reply = `${reply}\nYou have not joined a league yet. To join a league use /create [name] or /join [secret] commands.`;
        }

        request.reply(reply);

        this.log(ctx, 'Manager info is obtained and sent to a user.');
    }
}

module.exports = InfoCommandController;
