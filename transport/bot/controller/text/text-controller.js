'use strict';

const { Controller } = require('../../../../lib/controller');

class TextController extends Controller {

    async process(ctx, { request }) {
        const {
            message,
        } = request;

        this.logDebug(ctx, 'Handling a message from a user.', {
            message
        });

        request.reply('Hello, World!');
    }
}

module.exports = TextController;
