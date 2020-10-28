'use strict';

const { Controller } = require('../../../../../lib/controller');

/** @typedef {import('../../../../../lib/controller/controller').LoggingContext} LoggingContext */
/** @typedef {import('../../../../../lib/controller/controller').RequestOptions} RequestOptions */
/** @typedef {import('../../../../../lib/controller/controller').Options} ControllerOptions */
/**
 * @typedef {Object} JoinCommandControllerOptions
 * @property {import('../../../../../service/league/league-service')} leagueService -
 */
/** @typedef {JoinCommandControllerOptions & ControllerOptions} Options */

/**
 * @class JoinCommandController
 * @extends Controller
 */
class JoinCommandController extends Controller {

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

        if (league) {
            const { _id: leagueId, name } = league;

            this.log(ctx, 'A manager is already in a league.', { leagueId });

            request.reply(`You are already in ${name} league. To leave a league use /leaveleague command.`);

            return;
        }

        const secret = this._getText(ctx, { request });

        if (!secret) {
            this.logWarn(ctx, 'Unable to join a manager to a league without a secret.');
            request.reply('Please, sent a league secret. Use /joinleague [secret] command.');

            return;
        }

        const {
            _id: managerId,
        } = manager;

        this.log(ctx, 'Joining a manager to a league.', { managerId });

        const userLeague = await this._leagueService.getBySecret(ctx, { secret });

        if (!userLeague) {
            this.logWarn(ctx, 'Unable to join a manager to a league with invalid secret.', { secret });

            request.reply(`A league with secret ${secret} is not found.`);
            request.reply('Create a league with /createleague [name] command or use another secret.');
            
            return;
        }

        const { _id: leagueId, name } = userLeague;

        await this._leagueService.joinManager(ctx, {
            managerId,
            leagueId,
        });

        request.reply(`You have joined a league [${name}].`);

        this.log(ctx, 'A manager is joined to a league.', { managerId, leagueId });
    }
}

module.exports = JoinCommandController;
