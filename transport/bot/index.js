'use strict';

const { Telegraf } = require('telegraf');
const { Logable } = require('../../lib/log');
const { factory } = require('../../lib/controller');
const { CommandController } = require('./controller');
const Middleware = require('./middleware');
const { LeagueService, ManagerService } = require('../../service');

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

        const resolveManagerMiddleware = factory(Middleware.ResolveManagerMiddleware, {
            managerService, ...options,
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
            command: 'leaveleague', managerService, ...options,
        });

        const createTeamCommandController = factory(CommandController.CreateTeamCommandController, options);
        const createTransferCommandController = factory(CommandController.CreateTransferCommandController, options);
        const getTransferCommandController = factory(CommandController.GetTransferCommandController, options);
        const deleteTransferCommandController = factory(CommandController.DeleteTransferCommandController, options);

        this._bot.command('start', startCommandController);

        this._bot.use(resolveManagerMiddleware);

        this._bot.command('info', infoCommandController);

        this._bot.command('createleague', createLeagueCommandController);
        this._bot.command('joinleague', joinLeagueCommandController);
        this._bot.command('leaveleague', leaveLeagueCommandController);

        this._bot.command('create-team', createTeamCommandController);

        this._bot.command('create-transfer', createTransferCommandController);
        this._bot.command('get-transfer', getTransferCommandController);
        this._bot.command('delete-transfer', deleteTransferCommandController);

        this._bot.catch((error, ctx) => {
            this.logWarn({}, 'A message is processed with an error.', { error });
        });
    }
}

module.exports = BotTransport;
