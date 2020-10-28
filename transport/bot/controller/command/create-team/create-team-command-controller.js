'use strict';

const { Controller } = require('../../../../../lib/controller');

/** @typedef {import('../../../../../lib/controller/controller').Options} ControllerOptions */
/** @typedef {import('../../../../../lib/controller/controller').LoggingContext} LoggingContext */
/** @typedef {import('../../../../../lib/controller/controller').RequestOptions} RequestOptions */
/**
 * @typedef {Object} CreateTeamCommandControllerOptions
 * @property {import('../../../../../service/team/team-service')} teamService -
 */
/** @typedef {CreateTeamCommandControllerOptions & ControllerOptions} Options */

class CreateTeamCommandController extends Controller {

    /**
     * @constructor
     * @param {Options} options -
     */
    constructor(options) {
        super(options);

        this._teamService = options.teamService;
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
                team,
            },
        } = request;

        if (team) {
            const { _id: teamId, name } = team;

            this.log(ctx, 'A manager already has a team.', { teamId });

            request.reply(`You already have ${name} team.`);

            return;
        }

        const name = this._getText(ctx, { request });

        if (!name) {
            this.logWarn(ctx, 'Unable to create a team without a name.');

            request.reply('Please, sent a name for a team. Use /createteam [name] command.');

            return;
        }

        const {
            _id: managerId,
        } = manager;

        this.log(ctx, 'Creating a team for a manager.', { managerId, name })

        const createdTeam = await this._teamService.create(ctx, { name, managerId });

        request.reply(`You have created ${name} team.`);

        this.log(ctx, 'A team is created for a manager.', { team: createdTeam });
    }
}

module.exports = CreateTeamCommandController;
