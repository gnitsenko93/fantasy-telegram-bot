'use strict';

const { Telegraf } = require('telegraf');
const { Logable } = require('../../lib/log');
const { factory } = require('../../lib/controller');
const { CommandController, TextController } = require('./controller');
const Middleware = require('./middleware');
const { LeagueService, ManagerService } = require('../../service');

class BotTransport extends Logable {

    constructor(options) {
        super(options);

        const {
            storage
        } = options;

        this._storage = storage;

        const {
            token,
        } = options.config;

        this._bot = new Telegraf(token);
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
        };

        const leagueService = new LeagueService(options);
        const managerService = new ManagerService(options);

        const resolveManagerMiddleware = factory(Middleware.ResolveManagerMiddleware, {
            managerService, ...options,
        });
        const createCommandController = factory(CommandController.CreateCommandController, {
            leagueService, managerService, ...options,
        });
        const infoCommandController = factory(CommandController.InfoCommandController, {
            leagueService, managerService, ...options,
        });
        const joinCommandController = factory(CommandController.JoinCommandController, {
            leagueService, managerService, ...options,
        });
        const leaveCommandController = factory(CommandController.LeaveCommandController, {
            managerService, ...options,
        });

        this._bot.use(resolveManagerMiddleware);
        this._bot.command('create', createCommandController);
        this._bot.command('info', infoCommandController);
        this._bot.command('join', joinCommandController);
        this._bot.command('leave', leaveCommandController);
    }
}

module.exports = BotTransport;
