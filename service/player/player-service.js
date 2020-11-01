'use strict';

const { Logable } = require('../../lib/log');

const { PlayerModel } = require('../../model/index');

/** @typedef {import('../../lib/controller/controller').LoggingContext} LoggingContext */
/** @typedef {import('../../model/team/team-model').TeamId} TeamId */
/** @typedef {import('../../model/player/player-model').PlayerClub} PlayerClub */
/** @typedef {import('../../model/player/player-model').PlayerAmplua} PlayerAmplua */
/** @typedef {import('../../model/player/player-model').PlayerData} PlayerData */

class PlayerService extends Logable {

    constructor(options) {
        super(options);

        this._playerModel = new PlayerModel({
            ...options,
            config: {
                collection: 'players'
            },
        });
    }

    /**
     * Obtains players of a team.
     * @param {LoggingContext} ctx -
     * @param {{ teamId: TeamId }} options - 
     * @returns {Promise<PlayerData[]>} -
     */
    async getTeamPlayers(ctx, { teamId }) {
        try {
            this.logDebug(ctx, 'Obtaining team players.', { teamId });

            const players = await this._playerModel.loadMultiple(ctx, { teamId });

            this.logDebug(ctx, 'Team players are obtained.', {
                teamId, count: players.length,
            });

            return players;
        } catch (error) {
            this.logError(ctx, 'Error on obtaining team players.', { error });
            throw error;
        }
    }

    /**
     * Obtains a player.
     * @param {LoggingContext} ctx -
     * @param {Object} options -
     * @param {string} options.name player name
     * @param {PlayerClub} options.club player club
     * @param {PlayerAmplua} options.amplua player amplua
     * @returns {Promise<PlayerData>} - 
     */
    async get(ctx, { name, club, amplua }) {
        try {
            this.logDebug(ctx, 'Obtaining a player.', { name, club, amplua });

            const player = await this._playerModel.load(ctx, { name, club, amplua });

            if (!player) {
                this.logDebug(ctx, 'A player is not found in a database.');
    
                return null;
            }

            this.logDebug(ctx, 'A player is obtained.', { player });

            return player;
        } catch (error) {
            this.logError(ctx, 'Error on obtaining a player.', { error });

            throw error;
        }
    }
}

module.exports = PlayerService;
