'use strict';

const Model = require('../../lib/model');

/** @typedef {import('../../lib/controller/controller').LoggingContext} LoggingContext */
/** @typedef {import('mongodb').ObjectID} PlayerId */
/** @typedef {string} PlayerClub */
/** @typedef {'Защитник'|'Вратарь'|'Полузащитник'|'Нападающий'} PlayerAmplua */
/** @typedef {import('../team/team-model').TeamId} TeamId */
/**
 * @typedef {Object} PlayerData
 * @property {PlayerId} _id -
 * @property {PlayerAmplua} amplua -
 * @property {string} name -
 * @property {PlayerClub} club -
 * @property {string} price -
 * @property {number} externalId -
 * @property {TeamId} teamId -
 */

class PlayerModel extends Model {

    /**
     * Loads multiple players from a database.
     * @param {LoggingContext} ctx -
     * @param {{ teamId: TeamId }} options -
     * @returns {Promise<PlayerData[]>} - 
     */
    async loadMultiple(ctx, { teamId }) {
        try {
            this.logDebug(ctx, 'Loading multiple players from a database.');

            const players = await this._storage.getMany(ctx, {
                query: {
                    teamId,
                },
                collection: this._collection,
            });

            this.logDebug(ctx, 'Multiple players are obtained from a database.', {
                count: players.length,
            });

            return players;
        } catch (error) {
            this.logError(ctx, 'Error on loading multiple players from a database.', { error });
            throw error;
        }
    }

    /**
     * Loads a player from a database.
     * @param {LoggingContext} ctx -
     * @param {Object} options -
     * @param {PlayerId} options.playerId player name
     * @param {string} options.name player name
     * @param {PlayerClub} options.club player club
     * @param {PlayerAmplua} options.amplua player amplua
     * @returns {Promise<PlayerData>} - 
     */
    async load(ctx, options) {
        try {
            this.logDebug(ctx, 'Loading a player from a database.', options);

            const query = {
                _id: options.playerId,
                name: options.name,
                club: options.club,
                amplua: options.amplua,
            };

            const player = await this._storage.get(ctx, {
                query,
                collection: this._collection,
            });

            this.logDebug(ctx, 'A player is obtained from a database.', { player });

            return player;
        } catch (error) {
            this.logError(ctx, 'Error on loading a player from a database.', { error });
            throw error;
        }
    }
}

module.exports = PlayerModel;