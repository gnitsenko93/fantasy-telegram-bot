'use strict';

const ResolveLeagueMiddleware = require('./resolve-league/resolve-league-middleware');
const ResolveManagerMiddleware = require('./resolve-manager/resolve-manager-middleware');
const ResolveTeamMiddleware = require('./resolve-team/resolve-team-middleware');

module.exports = {
    ResolveLeagueMiddleware,
    ResolveManagerMiddleware,
    ResolveTeamMiddleware,
};
