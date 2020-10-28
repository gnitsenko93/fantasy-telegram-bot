'use strict';

const { Controller } = require('../../../../lib/controller');

/** @typedef {import('../../../../lib/controller/controller').RequestOptions} RequestOptions */
/** @typedef {import('../../../../lib/controller/controller').LoggingContext} LoggingContext */
/** @typedef { { teamService: import('../../../../service/team/team-service') } & import('../../../../lib/controller/controller').Options} Options */


class ResolveTeamMiddleware extends Controller {

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
            manager,
        } = request.state;

        if (!manager) {
            this.logWarn(ctx, 'Unable to resolve a team without a manager.');

            return;
        }

        const {
            _id: managerId,
        } = manager;

        this.logDebug(ctx, 'Resolving a team.', { managerId });

        const team = await this._teamService.getByOwner(ctx, { managerId });

        if (!team) {
            this.logWarn(ctx, 'Unable to resolve a team. A manager has not created a team yet.', { managerId });

            return;
        }

        this.logDebug(ctx, 'A team is resolved.', { team });

        request.state.team = team;
    }
}

module.exports = ResolveTeamMiddleware;
