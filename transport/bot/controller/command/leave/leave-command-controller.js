'use strict';

const { Controller } = require('../../../../../lib/controller');

class LeaveCommandController extends Controller {

    constructor(options) {
        super(options);

        this._command = '/leave';
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

        if (!this._managerService.hasLeague(ctx, { manager })) {
            request.reply('You have not joined a league yet.');

            return;
        }

        this.log(ctx, 'Leaving a league.', { userId })

        await this._managerService.leaveLeague(ctx, { userId });

        request.reply('A league is left.');

        this.log(ctx, 'A user left a league.', { userId });
    }
}

module.exports = LeaveCommandController;
