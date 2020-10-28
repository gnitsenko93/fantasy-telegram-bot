'use strict';

const { Controller } = require('../../../../../lib/controller');

/** @typedef {import('../../../../../lib/controller/controller').LoggingContext} LoggingContext */
/** @typedef {import('../../../../../lib/controller/controller').RequestOptions} RequestOptions */
/** @typedef {import('../../../../../lib/controller/controller').Options} ControllerOptions */
/**
 * @typedef {Object} LeaveCommandControllerOptions
 * @property {import('../../../../../service/league/league-service')} leagueService -
 */
/** @typedef {LeaveCommandControllerOptions & ControllerOptions} Options */

class LeaveCommandController extends Controller {

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
                league,
            },
        } = request;

        const { _id: managerId } = manager;

        if (!league) {
            this.log(ctx, 'Unable to remove a manager from a league since it has not joined a league yet.', { managerId });

            request.reply('You have not joined a league yet. To join a league use /joinleague [secret] command.');

            return;
        }

        const { _id: leagueId, name } = league;

        this.log(ctx, 'Removing a user from a league.', { managerId, leagueId });

        await this._leagueService.removeFromLeague(ctx, { managerId, leagueId });

        request.reply(`${name} league is left.`);

        this.log(ctx, 'A user is removed from a league.', { managerId, leagueId });
    }
}

module.exports = LeaveCommandController;
