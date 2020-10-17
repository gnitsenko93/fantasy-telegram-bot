'use strict';

const InfoCommandController = require('./info/info-command-controller');
const StartCommandController = require('./start/start-command-controller');

const CreateLeagueCommandController = require('./create-league/create-league-command-controller');
const JoinLeagueCommandController = require('./join-league/join-league-command-controller');
const LeaveLeagueCommandController = require('./leave-league/leave-league-command-controller');

const CreateTeamCommandController = require('./create-team/create-team-command-controller');

const CreateTransferCommandController = require('./create-transfer/create-transfer-command-controller');
const GetTransferCommandController = require('./get-transfer/get-transfer-command-controller');
const DeleteTransferCommandController = require('./delete-transfer/delete-transfer-command-controller');

module.exports = {
    InfoCommandController,
    StartCommandController,

    CreateLeagueCommandController,
    JoinLeagueCommandController,
    LeaveLeagueCommandController,

    CreateTeamCommandController,

    CreateTransferCommandController,
    GetTransferCommandController,
    DeleteTransferCommandController,
};
