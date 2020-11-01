'use strict';

const { Logable } = require('../../lib/log');

const { TransferModel } = require('../../model/index');

/** @typedef {import('../../lib/controller/controller').LoggingContext} LoggingContext */
/** @typedef {import('../../model/manager/manager-model').ManagerId} ManagerId */
/** @typedef {import('../../model/transfer/transfer-model').TransferData} TransferData */

class TransferService extends Logable {

    constructor(options) {
        super(options);

        this._transferModel = new TransferModel({
            ...options,
            config: {
                collection: 'transfers'
            },
        });
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

}

module.exports = TransferService;
