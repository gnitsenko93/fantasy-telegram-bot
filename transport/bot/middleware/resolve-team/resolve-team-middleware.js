'use strict';

const { Controller } = require('../../../../lib/controller');

class ResolveTeamMiddleware extends Controller {

    constructor(options) {
        super(options);

        this._teamService = options.teamService;
    }

    async process(ctx, { request }) {
        const {
            manager,
        } = request.state;

        const {
            userId,
        } = manager;

        this.logDebug(ctx, 'Resolving a team.', { userId });

        const team = await this._teamService.getByUserId(ctx, { userId });

        if (!team) {
            this.logWarn(ctx, 'Unable to resolve a team. A manager has not created a team yet.', { userId });

            return;
        }
        
        const { teamId } = team;

        this.logDebug(ctx, 'A team is resolved.', { userId, teamId });

        request.state.team = team;
    }
}

module.exports = ResolveTeamMiddleware;
