'use strict';

const _ = require('lodash');

const { Controller } = require('../../../../../lib/controller');
const { BusinessLogicError, errorType } = require('../../../../../error');

/** @typedef {import('../../../../../lib/controller/controller').LoggingContext} LoggingContext */
/** @typedef {import('../../../../../lib/controller/controller').RequestOptions} RequestOptions */
/** @typedef {import('../../../../../lib/controller/controller').Options} ControllerOptions */
/**
 * @typedef {Object} DeleteTransferCommandControllerOptions
 * @property {import('../../../../../service/transfer/transfer-service')} transferService -
 */
/** @typedef {DeleteTransferCommandControllerOptions & ControllerOptions} Options */

class DeleteTransferCommandController extends Controller {

    /**
     * @constructor
     * @param {Options} options -
     */
    constructor(options) {
        super(options);

        this._transferService = options.transferService;
    }

    /**
     * @param {LoggingContext} ctx - 
     * @param {RequestOptions} options -
     * @returns {Promise<void>} -
     */
    async process(ctx, { request }) {
        const { 
            state: {
                manager,
            },
        } = request;

        const {
            _id: managerId,
        } = manager;

        this.log(ctx, 'Handling a request for aborting a transfer.', {
            managerId,
        });

        const index = super._getText(ctx, { request });

        const priority = Number(index) - 1;

        if (_.isNaN(priority)) {
            this.logWarn(ctx, 'Unable to parse index of a transfer being aborted.', { index });

            request.reply(`Send an index (1, 2 or 3) of a transfer being aborted.\nI have received [${index}] instead. Use /abort [index] command.`);

            return;
        }

        await this._transferService.abort(ctx, { managerId, priority });

        request.reply('You have aborted a transfer. To list current transfers use /transfers command.');

        this.log(ctx, 'A request for aborting a transfer is handled.');
    }

    /**
     * @override
     * @param {LoggingContext} ctx -
     * @param {{ error: BusinessLogicError } & RequestOptions} options -
     * @returns {Promise<void>} -
     */
    processError(ctx, { error, request }) {
        this.logError(ctx, 'Handling an error on creating a transfer.', { error });

        switch(true) {
            case error instanceof BusinessLogicError && error.id === errorType.WrongTransferPriority:
                request.reply(error.message);
                throw error;
            default:
                super.processError(ctx, { error, request });
        }

        return;
    }
}

module.exports = DeleteTransferCommandController;
