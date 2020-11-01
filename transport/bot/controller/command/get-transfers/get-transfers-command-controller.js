'use strict';

const { Controller } = require('../../../../../lib/controller');

/** @typedef {import('../../../../../lib/controller/controller').LoggingContext} LoggingContext */
/** @typedef {import('../../../../../lib/controller/controller').RequestOptions} RequestOptions */
/** @typedef {import('../../../../../lib/controller/controller').Options} ControllerOptions */
/**
 * @typedef {Object} GetTransfersCommandControllerOptions
 * @property {import('../../../../../service/transfer/transfer-service')} transferService -
 */
/** @typedef {GetTransfersCommandControllerOptions & ControllerOptions} Options */

class GetTransfersCommandController extends Controller {

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


        this.log(ctx, 'Handling a request for getting list of transfers.', {
            managerId,
        });

        const transfersWithPlayers = await this._transferService.getManagerTransfersWithPlayers(ctx, { managerId });

        const { length: count } = transfersWithPlayers;

        if (!count) {
            const help = '/transfer <inbound player name>, <position>, <club> <outbound player name>, <position>, <club>';
            const example = '/transfer Влашич, Полузащитник, ЦСКА Бакаев, Полузащитник, Спартак';
            request.reply(`You have not submitted a transfer application yet. Use ${help}. For example:\n\n${example}`);

            return;
        }

        const reply = transfersWithPlayers.sort((t1, t2) => {
            return t1.priority < t2.priority? -1 : 1;
        }).reduce((result, transfer) => {
            const {
                priority,
                inboundPlayer: {
                    name: inboundPlayerName,
                    amplua: inboundPlayerAmplua,
                    club: inboundPlayerClub,
                },
                outboundPlayer: {
                    name: outboundPlayerName,
                    amplua: outboundPlayerAmplua,
                    club: outboundPlayerClub,
                }
            } = transfer;

            const inboundPlayer = `${inboundPlayerName}, ${inboundPlayerAmplua}, ${inboundPlayerClub}`;
            const outboundPlayer = `${outboundPlayerName}, ${outboundPlayerAmplua}, ${outboundPlayerClub}`;

            return `${result}${priority + 1}. ${inboundPlayer} in; ${outboundPlayer} out.\n`;
        }, `You have submitted ${count} transfer application (sorted in a priority).\n`);

        request.reply(reply);

        this.log(ctx, 'A request for getting list of transfers is handled.');
    }

}

module.exports = GetTransfersCommandController;
