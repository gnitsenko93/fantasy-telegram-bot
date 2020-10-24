'use strict';

const { Controller } = require('../../../../../lib/controller');
const { BusinessLogicError, NotFoundError, errorType } = require('../../../../../error');

/** @typedef {import('../../../../../lib/controller/controller').RequestOptions} RequestOptions */
/** @typedef {import('../../../../../lib/controller/controller').LoggingContext} LoggingContext */
/** @typedef { { managerService: import('../../../../../service/manager/manager-service') } & import('../../../../../lib/controller/controller').Options} Options */

class StartCommandController extends Controller {

    /**
     * @constructor
     * @param {Options} options -
     */
    constructor(options) {
        super(options);

        this._managerService = options.managerService;
    }

    /**
     * @param {LoggingContext} ctx -
     * @param {RequestOptions} options -
     * @returns {Promise<void>} -
     */
    async process(ctx, { request }) {
        let {
            from: {
                id: userId,
            },
        } = request;

        this.log(ctx, 'Trying to resolve a manager by userId.', { userId });

        const manager = await this._managerService.getByUserId(ctx, { userId });

        if (manager) {
            this.log(ctx, 'User is already registered as a manager.', { userId });

            request.reply('You are already registered as a manager. Use /info command for details.');
            
            return;
        }

        this.log(ctx, 'A user is not registered yet as a manager.', { userId });

        const {
            from: {
                id,
                first_name,
                last_name,
                username,
            },
        } = request;

        const user = {
            userId: id,
            firstName: first_name,
            lastName: last_name,
            username,
        };

        if (!this._config.options.enableManagerCreationWithoutSecret) {
            this.log(ctx, 'Creating a manager without a secret is disabled.');

            const secret = this._getText(ctx, { request });

            this.logDebug(ctx, 'A manager secret is populated from a message.', { secret });

            if (!secret) {
                throw new BusinessLogicError({
                    id: errorType.NoManagerSecret,
                    message: 'Unable to create a manager without a secret.',
                });
            }

            await this._registerManagerBySecret(ctx, { user, secret });

            request.reply('You are registered as a manager now. Use /info command for details.');

            return;
        }

        this.log(ctx, 'Creating a manager without a secret is enabled.');

        await this._registerManager(ctx, { user });

        request.reply('You are registered as a manager now.  Use /info command for details.');
    }

    async processError(ctx, { error, request }) {
        this.logError(ctx, 'Handling an error on creating a manager.', { error });

        switch(true) {
            case error instanceof BusinessLogicError && error.id === errorType.NoManagerSecret:
                request.reply('Unable to register a manager with no secret. Use /start [secret] command.');
                throw error;
            case error instanceof NotFoundError && error.id === errorType.UnknownManager:
                request.reply('You used wrong secret on registering. Try another one.');
                throw error;
            default:
                super.processError(ctx, { error, request });
        }
    }

    async _registerManager(ctx, { user }) {
        this.log(ctx, 'Registering a manager.', { user });

        const manager = await this._managerService.create(ctx, { user });

        this.log(ctx, 'A manager is registered.', { manager });
    }

    async _registerManagerBySecret(ctx, { user, secret }) {
        this.log(ctx, 'Registering a manager by a secret.', { user, secret });

        const manager = await this._managerService.getBySecret(ctx, { secret });

        if (!manager) {
            throw new NotFoundError({
                id: errorType.UnknownManager,
                message: 'Unable to find a manager by a secret.',
                resource: 'manager',
            });
        }

        const update = {
            ...manager,
            ...user,
        };

        const { userId } = update;

        this.logDebug(ctx, 'Actualizing a manager with a user data.', { userId, ...update });

        await this._managerService.update(ctx, { user: update });

        this.logDebug(ctx, 'Manager data is actualized.', { userId });
    }
}

module.exports = StartCommandController;
