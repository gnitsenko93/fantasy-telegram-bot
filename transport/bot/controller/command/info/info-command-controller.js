'use strict';

const { Controller } = require('../../../../../lib/controller');

/** @typedef {import('../../../../../lib/controller/controller').LoggingContext} LoggingContext */
/** @typedef {import('../../../../../lib/controller/controller').RequestOptions} RequestOptions */
/**
 * @typedef {Object} InfoCommandControllerOptions
 * @property {import('../../../../../service/league/league-service')} leagueService -
 * @property {import('../../../../../service/manager/manager-service')} managerService -
 * @property {import('../../../../../service/player/player-service')} playerService -
 */
/** @typedef {InfoCommandControllerOptions & import('../../../../../lib/controller/controller').Options} Options */

class InfoCommandController extends Controller {

    /**
     * @constructor
     * @param {Options} options -
     */
    constructor(options) {
        super(options);

        this._leagueService = options.leagueService;
        this._managerService = options.managerService;
        this._playerService = options.playerService;
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
                league,
                team,
            },
        } = request;

        if (!manager) {
            this.logWarn(ctx, 'Unable to obtain unknown manager info.');

            request.reply('Use /start command to register as a manager.');

            return;
        }

        const {
            _id: managerId,
            firstName: name,
        } = manager;

        this.log(ctx, 'Obtaining manager info.', { managerId });

        let reply = `Hello, ${name}!`;

        if (league) {
            const {
                name: leagueName,
                secret,
            } = league;

            reply = `${reply}\nYou are in a ${leagueName} league. Your league secret is ${secret}.`;
        } else {
            reply = `${reply}\nYou have not joined a league yet. To join a league use /createleague [name] or /joinleague [secret] commands.`;
        }

        if (team) {
            const {
                _id: teamId,
                name: teamName,
            } = team;

            reply = `${reply}\nYour team is ${teamName}.`;

            const players = await this._playerService.getTeamPlayers(ctx, { teamId });

            if (!players.length) {
                reply = `${reply}\nYou have no players signed.`;
            } else {
                reply = `${reply}\nYou have signed ${players.length} players:`;

                for (let index in players) {
                    const {
                        amplua,
                        name: playerName,
                        price,
                        club,
                    } = players[index];

                    reply = `${reply}\n${Number(index) + 1}. ${playerName}, ${amplua}, ${club}. Price is ${price}.`;
                }
            }
        } else {
            reply = `${reply}\nYou do not have a team yet. To create a team use /createteam [name] command.`
        }

        request.reply(reply);

        this.log(ctx, 'Manager info is obtained and sent to a user.', { managerId });
    }
}

module.exports = InfoCommandController;
