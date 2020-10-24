'use strict';

const { Controller } = require('../../../../../lib/controller');

/**
 * @typedef {Object} InfoCommandControllerOptions
 * @property {import('../../../../../service/league/league-service')} leagueService -
 * @property {import('../../../../../service/manager/manager-service')} managerService -
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
    }

    async process(ctx, { request }) {
        const {
            state: {
                manager,
                league,
                team,
            },
        } = request;

        const {
            userId,
            firstName: name,
        } = manager;

        this.log(ctx, 'Getting manager info.', { userId });

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
                name: teamName,
            } = team;

            reply = `${reply}\nYou have ${teamName}.`;
        } else {
            reply = `${reply}\nYou do not have a team yet. To create a team use /createteam [name] command.`
        }

        request.reply(reply);

        this.log(ctx, 'Manager info is obtained and sent to a user.');
    }
}

module.exports = InfoCommandController;
