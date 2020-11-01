'use strict';

const { Logable } = require('../../lib/log');
const { TransferModel } = require('../../model/index');
const { BusinessLogicError, errorType } = require('../../error')

/** @typedef {import('../../lib/controller/controller').LoggingContext} LoggingContext */
/** @typedef {import('../../model/manager/manager-model').ManagerId} ManagerId */
/** @typedef {import('../../model/transfer/transfer-model').TransferId} TransferId */
/** @typedef {import('../../model/player/player-model').PlayerData} PlayerData */
/** @typedef {import('../../model/transfer/transfer-model').TransferData} TransferData */
/** @typedef {import('../../lib/log/logable').LogableOptions} LogableOptions */
// TODO: Implement Service interface.
/**
 * @typedef {Object} ServiceOptions
 * @property {import('../../config')} config -
 * @property {import('../../storage/mongo/mongo-storage')} storage -
 */
/**
 * @typedef {Object} TransferServiceOptions
 * @property {import('../player/player-service')} playerService -
 */
/** @typedef {TransferServiceOptions & ServiceOptions & LogableOptions} Options */

class TransferService extends Logable {

    /**
     * @constructor
     * @param {Options} options -
     */
    constructor(options) {
        super(options);

        this._transferModel = new TransferModel({
            ...options,
            config: {
                collection: 'transfers'
            },
        });

        this._playerService = options.playerService;
    }

    /**
     * Obtains a transfer.
     * @param {LoggingContext} ctx -
     * @param {{ managerId: ManagerId, priority: number }} options - 
     * @returns {Promise<TransferData>} -
     */
    async get(ctx, { managerId, priority }) {
        try {
            this.logDebug(ctx, 'Obtaining a transfer.', { managerId, priority });

            const transfer = await this._transferModel.load(ctx, { managerId, priority });

            if (!transfer) {
                this.logWarn(ctx, 'A transfer is not found.');

                return null;
            }

            this.logDebug(ctx, 'A transfer is obtained.', { transfer });

            return transfer;
        } catch (error) {
            this.logError(ctx, 'Error on obtaining a transfer.', { error });

            throw error;
        }
    }

    /**
     * Obtains transfers of a manager.
     * @param {LoggingContext} ctx -
     * @param {{ managerId: ManagerId }} options - 
     * @returns {Promise<TransferData[]>} -
     */
    async getManagerTransfers(ctx, { managerId }) {
        try {
            this.logDebug(ctx, 'Obtaining manager transfers.', { managerId });

            const transfers = await this._transferModel.loadMultiple(ctx, { managerId });

            this.logDebug(ctx, 'Manager transfers are obtained.', {
                managerId, transfers,
            });

            return transfers;
        } catch (error) {
            this.logError(ctx, 'Error on obtaining manager transfers.', { error });
            throw error;
        }
    }

    /**
     * @typedef {Object} TransferDataWithPlayers
     * @property {TransferId} _id -
     * @property {PlayerData} inboundPlayer -
     * @property {PlayerData} outboundPlayer -
     * @property {number} priority -
     * @property {ManagerId} ownerId -
     */

    /**
     * Obtains transfers of a manager with resolved players data.
     * @param {LoggingContext} ctx -
     * @param {{ managerId: ManagerId }} options -
     * @returns {Promise<TransferDataWithPlayers[]>} - 
     */
    async getManagerTransfersWithPlayers(ctx, { managerId }) {
        try {
            this.logDebug(ctx, 'Getting manager transfers with players.', { managerId });

            const transfers = await this.getManagerTransfers(ctx, { managerId });

            /** @type {TransferDataWithPlayers[]} */
            let results = [];

            for (let transfer of transfers) {
                const {
                    inbound: inboundPlayerId,
                    outbound: outboundPlayerId,
                } = transfer;

                const inboundPlayer = await this._playerService.get(ctx, { playerId: inboundPlayerId });
                const outboundPlayer = await this._playerService.get(ctx, { playerId: outboundPlayerId });

                results.push({
                    ...transfer,
                    inboundPlayer,
                    outboundPlayer,
                });
            }

            this.logDebug(ctx, 'Manager transfers with players are obtained.', {
                transfers: results,
            });

            return results;
        } catch (error) {
            this.logError(ctx, 'Error on obtaining managers transfers with players.', { error });

            throw error;
        }
    }

    /**
     * Counts transfers of a manager.
     * @param {LoggingContext} ctx -
     * @param {{ managerId: ManagerId }} options - 
     * @returns {Promise<number>} -
     */
    async countManagerTransfers(ctx, { managerId }) {
        try {
            this.logDebug(ctx, 'Calculating number of manager transfers.', { managerId });

            const count = await this._transferModel.count(ctx, { managerId });

            this.logDebug(ctx, 'Number of manager transfers is calculated.', {
                managerId, count,
            });

            return count;
        } catch (error) {
            this.logError(ctx, 'Error on obtaining manager transfers.', { error });
            throw error;
        }
    }

    /**
     * Creates a transfer.
     * @param {LoggingContext} ctx -
     * @param {Object} options - 
     * @param {ManagerId} options.managerId -
     * @param {import('../../model/player/player-model').PlayerData} options.inbound -
     * @param {import('../../model/player/player-model').PlayerData} options.outbound -
     * @param {number} [options.priority] -
     * @returns {Promise<TransferData>} -
     */
    async create(ctx, { managerId, inbound, outbound, priority }) {
        try {
            this.logDebug(ctx, 'Creating a transfer.', { managerId, inbound, outbound, priority });

            let count;
            if (typeof priority === 'undefined') {
                count = await this.countManagerTransfers(ctx, { managerId });
            }

            const transfer = await this._transferModel.create(ctx, {
                managerId,
                inbound: inbound._id,
                outbound: outbound._id,
                priority: typeof priority !== 'undefined'? priority : count,
            });

            this.logDebug(ctx, 'A transfer is created.', { transfer });

            return transfer;
        } catch (error) {
            this.logError(ctx, 'Error on creating a transfer.', { error });

            throw error;
        }
    }

    /**
     * Aborts a transfer.
     * @param {LoggingContext} ctx -
     * @param {{ managerId: ManagerId, priority: number }} options -
     * @throws {BusinessLogicError} Will throw an error if priority is larger than a number of transfers or negative.
     * @returns {Promise<void>} a transfer is aborted.
     */
    async abort(ctx, { managerId, priority }) {
        try {
            this.logDebug(ctx, 'Aborting a transfer.', { managerId, priority });

            const count = await this.countManagerTransfers(ctx, { managerId });

            if (priority < 0) {
                this.logError(ctx, 'Unable to abort a transfer with a negative priority.', {
                    priority,
                });

                throw new BusinessLogicError({
                    id: errorType.WrongTransferPriority,
                    message: 'Unable to abort a transfer with a negative priority.'
                });
            }

            if (priority > count) {
                this.logError(ctx, 'Unable to abort a transfer with a priority larger than a number of manager transfers.', {
                    priority, count,
                });

                throw new BusinessLogicError({
                    id: errorType.WrongTransferPriority,
                    message: 'Priority is greater than a number of transfers.'
                });
            }

            await this._transferModel.deleteAndReprioritize(ctx, { managerId, priority });

            this.logDebug(ctx, 'A transfer is aborted.');
        } catch (error) {
            this.logError(ctx, 'Unhandled error on aborting a transfer.', { error });

            throw error;
        }
    }
}

module.exports = TransferService;
