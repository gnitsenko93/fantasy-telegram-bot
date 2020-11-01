'use strict';

const { Controller } = require('../../../../../lib/controller');
const { BusinessLogicError, NotFoundError, errorType } = require('../../../../../error');

/** @typedef {import('../../../../../model/manager/manager-model').ManagerId} ManagerId */
/** @typedef {import('../../../../../model/player/player-model').PlayerClub} PlayerClub */
/** @typedef {import('../../../../../model/player/player-model').PlayerAmplua} PlayerAmplua */
/** @typedef {import('../../../../../model/player/player-model').PlayerData} PlayerData */
/** @typedef {import('../../../../../lib/controller/controller').LoggingContext} LoggingContext */
/** @typedef {import('../../../../../lib/controller/controller').RequestOptions} RequestOptions */
/** @typedef {import('../../../../../lib/controller/controller').Options} ControllerOptions */
/**
 * @typedef {Object} CreateTransferCommandControllerOptions
 * @property {import('../../../../../service/transfer/transfer-service')} transferService -
 * @property {import('../../../../../service/player/player-service')} playerService -
 */
/** @typedef {CreateTransferCommandControllerOptions & ControllerOptions} Options */

class CreateTransferCommandController extends Controller {

    /**
     * @constructor
     * @param {Options} options -
     */
    constructor(options) {
        super(options);

        this._playerService = options.playerService;
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


        this.log(ctx, 'Handling transfer creating for a manager.', {
            managerId,
        });

        await this._checkCanCreateTransfer(ctx, { managerId });

        const {
            inbound: inboundApplication,
            outbound: outboundApplication,
        } = this._parseApplications(ctx, { request });

        const {
            inbound: inboundPlayer,
            outbound: outboundPlayer,
        } = await this._resolvePlayers(ctx, {
            inbound: inboundApplication,
            outbound: outboundApplication,
        });

        const transfer = await this._transferService.create(ctx, {
            managerId,
            inbound: inboundPlayer,
            outbound: outboundPlayer,
        });

        const reply = 
            `Your transfer application has been registered.\n
            Transfer priority is ${transfer.priority + 1}.\n
            Requested player is ${inboundPlayer.name}, ${inboundPlayer.amplua}, ${inboundPlayer.club}.\n
            Dropped player is ${outboundPlayer.name}, ${outboundPlayer.amplua}, ${outboundPlayer.club}.\n
            To list all your transfers use /transfers command.`;

        request.reply(reply);

        this.log(ctx, 'Transfer creation for a manager is handled.', {
            managerId, transfer,
        });
    }
    
    /**
     * Checks whether a manager can create yet another transfer.
     * @param {LoggingContext} ctx -
     * @param {{ managerId: ManagerId }} options -
     * @throws {BusinessLogicError} Will throw an error if transfers count is exceeded.
     * @returns {Promise<void>} - 
     */
    async _checkCanCreateTransfer(ctx, { managerId }) {
        this.logDebug(ctx, 'Checking whether a manager can create yet another transfer.', { managerId });

        const count = await this._transferService.countManagerTransfers(ctx, { managerId });

        const limit = this._config.options.transfersCount;

        if (count >= limit) {
            this.logError(ctx, 'Unable to create a transfer since a manager has exceeded its possible count.', {
                limit, count,
            });

            throw new BusinessLogicError({
                id: errorType.TransfersExceeded,
                message: 'Transfers count is exceeded.',
            });
        }

        this.logDebug(ctx, 'A manager can create yet another transfer.', {
            count, limit,
        });
    }

    /**
     * @typedef {Object} TransferApplication
     * @property {string} name - 
     * @property {PlayerAmplua} amplua -
     * @property {PlayerClub} club - 
     */

    /**
     * @override
     * @param {LoggingContext} ctx - 
     * @param {RequestOptions} options -
     * @throws {BusinessLogicError} Will throw an error if parsing has failed.
     * @returns {{inbound: TransferApplication, outbound: TransferApplication}} -
     */
    _parseApplications(ctx, { request }) {
        try {
            this.logDebug(ctx, 'Parsing transfer applications.');

            const players = super._getText(ctx, { request });
    
            const [inName, inAmplua, inClub, outName, outAmplua, outClub] = players.match(/[\А-Яа-я]+/g);

            const result = {
                inbound: {
                    name: inName,
                    amplua: inAmplua,
                    club: inClub,
                },
                outbound: {
                    name: outName,
                    amplua: outAmplua,
                    club: outClub,
                }
            };

            this.logDebug(ctx, 'Transfer applications are parsed.', result);
    
            return result;
        } catch (error) {
            this.logError(ctx, 'Error to parsing transfer applications from a user message.', { error });

            throw new BusinessLogicError({
                id: errorType.ParsingError,
                message: 'Unable to parse transfer players.',
            });
        }
    }

    /**
     * Resolves a player.
     * @param {LoggingContext} ctx -
     * @param {{ inbound: TransferApplication, outbound: TransferApplication, }} options -
     * @throws {NotFoundError} Will throw an error if a play is not resolved.
     * @returns {Promise<{ inbound: PlayerData, outbound: PlayerData }>} - 
     */
    async _resolvePlayers(ctx, { inbound, outbound }) {
        this.logDebug(ctx, 'Resolving inbound player from a manager application.', { application: inbound });

        const inboundPlayer = await this._resolvePlayer(ctx, { application: inbound });

        if (!inboundPlayer) {
            this.logWarn(ctx, 'Inbound player is not found.', { application: inbound });

            throw new NotFoundError({
                id: errorType.UnknownInboundPlayer,
                message: 'Inbound player from manager application is not resolved.',
                resource: inbound
            });
        }

        this.logDebug(ctx, 'Inbound player is resolved.', { player: inboundPlayer });

        this.logDebug(ctx, 'Resolving outbound player from a manager application.', { application: outbound });

        const outboundPlayer = await this._resolvePlayer(ctx, { application: outbound });

        if (!outboundPlayer) {
            this.logWarn(ctx, 'Outbound player is not found.', { application: outbound });

            throw new NotFoundError({
                id: errorType.UnknownOutboundPlayer,
                message: 'Outbound player from manager application is not resolved.',
                resource: outbound
            });
        }

        this.logDebug(ctx, 'Outbound player is resolved.', { player: outboundPlayer });

        return {
            inbound: inboundPlayer,
            outbound: outboundPlayer,
        };
    }

    /**
     * Resolves a player.
     * @param {LoggingContext} ctx -
     * @param {{ application: TransferApplication }} options -
     * @throws {NotFoundError} Will throw an error if a play is not resolved.
     * @returns {Promise<PlayerData>} - 
     */
    async _resolvePlayer(ctx, { application }) {
        this.logDebug(ctx, 'Resolving a player from manager application.', { application });

        try {
            const player = await this._playerService.get(ctx, application);

            this.logDebug(ctx, 'A player is resolved from manager application.', { player });

            return player;
        } catch (error) {
            this.logError('Error on resolving manager application.', { error });

            throw error;
        }
    }

    /**
     * @override
     * @param {LoggingContext} ctx -
     * @param {{ error: BusinessLogicError|NotFoundError } & RequestOptions} options -
     * @returns {Promise<void>} -
     */
    processError(ctx, { error, request }) {
        this.logError(ctx, 'Handling an error on creating a transfer.', { error });

        switch(true) {
            case error instanceof BusinessLogicError && error.id === errorType.TransfersExceeded:
                request.reply('You have exceeded number of possible transfers. Check your applications using /transfers command.');
                throw error;
            case error instanceof BusinessLogicError && error.id === errorType.ParsingError:
                request.reply(`There was a problem with parsing your message: [${super._getText(ctx, { request })}]`);
                request.reply('Correct usage of the command is /transfer <inbound player name>, <position>, <club> <outbound player name>, <position>, <club>');
                request.reply('For example, /transfer Кокорин, Нападающий, Спартак Деспотович, Нападающий, Рубин');
                throw error;
            case error instanceof NotFoundError && (error.id === errorType.UnknownInboundPlayer || error.id === errorType.UnknownOutboundPlayer):
                const {
                    resource: {
                        name, amplua, club,
                    },
                } = error;

                request.reply(`${error.id === errorType.UnknownInboundPlayer? 'Inbound' : 'Outbound'} player (${name}, ${amplua}, ${club}) from your application is not found.`);
                throw error;
            default:
                super.processError(ctx, { error, request });
        }

        return;
    }
}

module.exports = CreateTransferCommandController;
