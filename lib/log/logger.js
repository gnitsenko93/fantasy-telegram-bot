'use strict';

class Logger {

    constructor() {
        this._logger = console;
    }
    
    info(context, message, meta) {
        this._logger.log(this._build(context, message, meta));
    }

    debug(context, message, meta) {
        this._logger.debug(this._build(context, message, meta));
    }

    warn(context, message, meta) {
        this._logger.warn(this._build(context, message, meta));
    }

    error(context, message, meta) {
        this._logger.error(this._build(context, message, meta));
    }

    _build(context, message, meta) {
        for (let prop in meta) {
            const obj = meta[prop];
            if (obj instanceof Error) {
                meta[prop] = obj.toString();
            }
        }

        const ts = (new Date()).toISOString();

        return JSON.stringify({ ts, ...context, message, meta });
    }
}

module.exports = Logger;
