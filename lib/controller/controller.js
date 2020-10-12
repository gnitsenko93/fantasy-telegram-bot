'use strict';

const { nanoid } = require('nanoid');

const { Logable } = require('../log');

class Controller extends Logable {

    async handler(ctx, next) {
        let traceId = ctx.state.traceId;

        if (!traceId) {
            traceId = nanoid();
            ctx.state.traceId = traceId;
        }

        const logCtx = { traceId };

        this.log(logCtx, 'Processing a message.');
        try {
            await this.process(logCtx, { request: ctx });
        } catch (error) {
            this.logError(logCtx, 'Error on processing a message.', { error });
            ctx.reply('There is a problem with processing a message.');
            ctx.reply('Developers are informed and will fix the problem.');
            return next();
        }
        this.log(logCtx, 'A message is processed.');
        
        return next();
    }

    async process(logCtx, { request }) {
        return;
    }
}

module.exports = Controller;
