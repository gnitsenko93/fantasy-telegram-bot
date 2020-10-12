'use strict';

class BusinessLogicError extends Error {

    constructor(options) {
        const {
            id,
            message,
        } = options;

        super(message);

        this._id = id;
    }

}

module.exports = BusinessLogicError;
