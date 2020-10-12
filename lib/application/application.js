'use strict';

const { Logable } = require('../log');

class Application extends Logable {

    constructor(options) {
        super(options);

        this._transport = options.transport;
        this._storage = options.storage;
    }

    async start(ctx) {
        this.log(ctx, 'Starting an application.');
        await this._startStorage(ctx);
        await this._startTransport(ctx);
        this.log(ctx, 'Application is started.');
    }

    async stop(ctx) {
        this.log(ctx, 'Stopping a application.');
        await this._stopTransport(ctx);
        await this._stopStorage(ctx);
        this.log(ctx, 'Application is stopped.');
    }

    async _startTransport(ctx) {
        await this._transport.start(ctx);
    }

    async _stopTransport(ctx) {
        await this._transport.stop(ctx);
    }

    async _startStorage(ctx) {
        await this._storage.start(ctx);
    }

    async _stopStorage(ctx) {
        await this._storage.stop(ctx);
    }
}

module.exports = Application;
