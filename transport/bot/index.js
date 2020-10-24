'use strict';

const { Telegraf } = require('telegraf');
const { Logable } = require('../../lib/log');
const { factory } = require('../../lib/controller');
const { CommandController } = require('./controller');
const Middleware = require('./middleware');
const { LeagueService, ManagerService, TeamService } = require('../../service');

/**
 * @typedef {Object} BotTransportOptions
 * @property {import('../../config')} config -
 * @property {import('../../storage/mongo/mongo-storage')} storage -
 */
/** @typedef {BotTransportOptions & import('../../lib/log/logable').LogableOptions} Options */

class BotTransport extends Logable {

    /**
     * @constructor
     * @param {Options} options -
     */
    constructor(options) {
        super(options);

        const {
            config,
            storage,
        } = options;

        this._config = config;
        this._storage = storage;
        this._bot = new Telegraf(this._config.token);
    }

    async start(ctx) {
        this.log(ctx, 'Starting a bot.');
        this._init();
        await this._bot.launch();
        this.log(ctx, 'A bot is started.');
    }

    async stop(ctx) {
        this.log(ctx, 'Stopping a bot.');
        await this._bot.stop();
        this.log(ctx, 'A bot is stopped.');
    }

    _init() {
        const options = {
            logger: this._logger,
            storage: this._storage,
            config: this._config,
        };

        const leagueService = new LeagueService(options);
        const managerService = new ManagerService(options);
        const teamService = new TeamService(options);

        const resolveLeagueMiddleware = factory(Middleware.ResolveLeagueMiddleware, {
            leagueService, ...options,
        });
        const resolveManagerMiddleware = factory(Middleware.ResolveManagerMiddleware, {
            managerService, ...options,
        });
        const resolveTeamService = factory(Middleware.ResolveTeamMiddleware, {
            teamService, ...options,
        });

        const infoCommandController = factory(CommandController.InfoCommandController, {
            command: 'info', leagueService, managerService, ...options,
        });
        const startCommandController = factory(CommandController.StartCommandController, {
            command: 'start', managerService, ...options,
        });
        const createLeagueCommandController = factory(CommandController.CreateLeagueCommandController, {
            command: 'createleague', leagueService, managerService, ...options,
        });
        const joinLeagueCommandController = factory(CommandController.JoinLeagueCommandController, {
            command: 'joinleague', leagueService, managerService, ...options,
        });
        const leaveLeagueCommandController = factory(CommandController.LeaveLeagueCommandController, {
            command: 'leaveleague', leagueService, ...options,
        });
        const createTeamCommandController = factory(CommandController.CreateTeamCommandController, {
            command: 'createTeam', managerService, teamService, ...options,
        });

        const createTransferCommandController = factory(CommandController.CreateTransferCommandController, options);
        const getTransferCommandController = factory(CommandController.GetTransferCommandController, options);
        const deleteTransferCommandController = factory(CommandController.DeleteTransferCommandController, options);

        this._bot.command('start', startCommandController);

        this._bot.use(resolveManagerMiddleware);

        this._bot.command('info', 
            resolveLeagueMiddleware,
            resolveTeamService,
            infoCommandController
        );

        this._bot.command('createleague', createLeagueCommandController);
        this._bot.command('joinleague', resolveLeagueMiddleware, joinLeagueCommandController);
        this._bot.command('leaveleague', resolveLeagueMiddleware, leaveLeagueCommandController);

        this._bot.command('createteam', resolveTeamService, createTeamCommandController);

        this._bot.command('createtransfer', createTransferCommandController);
        this._bot.command('gettransfer', getTransferCommandController);
        this._bot.command('deletetransfer', deleteTransferCommandController);

        this._bot.catch((error, ctx) => {
            const {
                state: {
                    traceId,
                },
            } = ctx;

            this.logWarn({ traceId }, 'A message is processed with an error.', { error });
        });
    }
}

module.exports = BotTransport;
