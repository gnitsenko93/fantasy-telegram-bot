'use strict';

const Model = require('../../lib/model');

/** @typedef {import('../../lib/controller/controller').LoggingContext} LoggingContext */
/** @typedef {import('mongodb').ObjectID} TransferId */
/** @typedef {import('../manager/manager-model').ManagerId} ManagerId */
/** @typedef {import('../player/player-model').PlayerId} PlayerId */
/** @typedef {import('../player/player-model').PlayerData} PlayerData */
/**
 * @typedef {Object} TransferData
 * @property {TransferId} _id -
 * @property {ManagerId} ownerId -
 * @property {PlayerId} inboundPlayer -
 * @property {PlayerId} outboundPlayer -
 * @property {number} priority -
 */

class TransferModel extends Model {

    /**
     * Loads multiple transfers from a database.
     * @param {LoggingContext} ctx -
     * @param {{ managerId: ManagerId }} query -
     * @returns {Promise<TransferData[]>} - 
     */
    async loadMultiple(ctx, { managerId }) {
        try {
            this.logDebug(ctx, 'Loading multiple transfers from a database.');

            const transfers = await this._storage.getMany(ctx, {
                query: {
                    managerId,
                },
                collection: this._collection,
            });

            this.logDebug(ctx, 'Multiple transfers are obtained from a database.', {
                count: transfers.length,
            });

            return transfers;
        } catch (error) {
            this.logError(ctx, 'Error on loading multiple transfers from a database.', { error });
            throw error;
        }
    }

    /**
     * Counts transfers in a database by a query.
     * @param {LoggingContext} ctx -
     * @param {{ managerId: ManagerId }} query -
     * @returns {Promise<number>} - 
     */
    async count(ctx, { managerId }) {
        try {
            this.logDebug(ctx, 'Calculating number of transfers in a database.');

            const count = await this._storage.count(ctx, {
                query: {
                    managerId,
                },
                collection: this._collection,
            });

            this.logDebug(ctx, 'Number of transfers in a database is calculated.', {
                count,
            });

            return count;
        } catch (error) {
            this.logError(ctx, 'Error on calculating number of transfers in a database.', { error });
            throw error;
        }
    }

    /**
     * Creates a transfer in a database.
     * @param {LoggingContext} ctx -
     * @param {Object} options - 
     * @param {ManagerId} options.managerId -
     * @param {PlayerId} options.inbound -
     * @param {PlayerId} options.outbound -
     * @param {number} options.priority -
     * @returns {Promise<TransferData>} -
     */
    async create(ctx, { managerId, inbound, outbound, priority }) {
        try {
            this.logDebug(ctx, 'Creating a transfer in a database.', {
                managerId, inbound, outbound, priority,
            });

            const value = { managerId, inbound, outbound, priority };

            const transfer = await this._storage.set(ctx, {
                value,
                collection: this._collection,
            });

            this.logDebug(ctx, 'A transfer is created in a database.', {
                transfer,
            });

            return transfer;
        } catch (error) {
            this.logError(ctx, 'Error on creating a transfer.', { error });

            return error;
        }
    }
}

module.exports = TransferModel;