'use strict';

const { Controller } = require('../../../../lib/controller');
const { NotFoundError, errorType } = require('../../../../error');

/** @typedef {import('../../../../lib/controller/controller').Context} Context */
/** @typedef {import('../../../../lib/controller/controller').LoggingContext} LoggingContext */
/** @typedef { { managerService: import('../../../../service/manager/manager-service') } & import('../../../../lib/controller/controller').ControllerOptions} Options */

class ResolveManagerMiddleware extends Controller {

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
     * @param {{ request: Context }} options -
     * @returns {Promise<void>} -
     */
    async process(ctx, { request }) {
        const {
            from: {
                id: userId,
            },
        } = request;

        this.log(ctx, 'Resolving a manager by userId.', { userId });

        let manager = await this._managerService.getByUserId(ctx, { userId });

        if (manager === null) {
            throw new NotFoundError({
                id: errorType.UnknownManager,
                resource: 'manager',
                message: 'A manager is not resolved.',
            });
        }

        this.log(ctx, 'A manager is resolved.', { userId });

        request.state.manager = manager;
    }

    /**
     * @param {LoggingContext} ctx -
     * @param {{ error: Error, request: Context }} options -
     * @returns {Promise<void>} -
     */
    async processError(ctx, { error, request }) {
        const {
            from: {
                id: userId,
            },
        } = request;

        this.logError(ctx, 'Handling an error on resolving a manager.', { error, userId });

        switch(true) {
            case error instanceof NotFoundError && error.id === errorType.UnknownManager:
                request.reply('Use /start command to register as a manager.');
                throw error;
            default:
                super.processError(ctx, { error, request });
        }
    }
}

module.exports = ResolveManagerMiddleware;
