'use strict';

const LeagueService = require('./league/league-service');
const ManagerService = require('./manager/manager-service');
const PlayerService = require('./player/player-service');
const TeamService = require('./team/team-service');
const TransferService = require('./transfer/transfer-service');

module.exports = {
    LeagueService,
    ManagerService,
    PlayerService,
    TeamService,
    TransferService,
};
