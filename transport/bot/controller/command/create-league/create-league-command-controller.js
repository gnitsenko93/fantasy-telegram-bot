'use strict';

const { Controller } = require('../../../../../lib/controller');

/** @typedef {import('../../../../../lib/controller/controller').Options} ControllerOptions */
/** @typedef {{leagueService: import('../../../../../service/league/league-service')} & ControllerOptions} Options */
/** @typedef {import('../../../../../lib/controller/controller').LoggingContext} LoggingContext */
/** @typedef {import('../../../../../lib/controller/controller').RequestOptions} RequestOptions */

class CreateLeagueCommandController extends Controller {

    /**
     * @constructor
     * @param {Options} options -
     */
    constructor(options) {
        super(options);

        this._leagueService = options.leagueService;
    }

    /**
     * @param {LoggingContext} ctx - 
     * @param {RequestOptions} options -
     * @returns {Promise<void>} -
     */
    async process(ctx, { request }) {
        const {
            state: {
                manager,
            },
        } = request;

        const {
            _id: managerId,
        } = manager;

        const name = this._getText(ctx, { request });

        if (!name) {
            this.logWarn(ctx, 'Unable to create a league without a name.');

            request.reply('Please, sent a name for a league. Use /createleague [name] command.');

            return;
        }

        this.log(ctx, 'Creating a league.', { managerId })

        const league = await this._leagueService.create(ctx, { managerId, name });

        const { secret } = league;

        request.reply(`A league is created. League name is ${name}. League secret is ${secret}.`);

        this.log(ctx, 'A league is created.', { league });
    }
}

module.exports = CreateLeagueCommandController;
