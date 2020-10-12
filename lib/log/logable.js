'use strict';

class Logable {

    constructor(options) {
        this._logger = options.logger;
    }

    log(context, message, meta) {
        this._logger.info(context, message, meta);
    }

    logDebug(context, message, meta) {
        this._logger.debug(context, message, meta);
    }

    logWarn(context, message, meta) {
        this._logger.warn(context, message, meta);
    }

    logError(context, message, meta) {
        this._logger.error(context, message, meta);
    }
}

module.exports = Logable;
