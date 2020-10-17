'use strict';

/**
 * @typedef {Object} Options -
 * @property {import('../type/error-type').ErrorId} id -
 * @property {string} message -
 */

class BusinessLogicError extends Error {

    /**
     * @constructor
     * @param {Options} options -
     */
    constructor(options) {
        const {
            id,
            message,
        } = options;

        super(message);

        this._id = id;
    }

    get id() {
        return this._id;
    }

    toJSON() {
        return {
            id: this._id,
            message: this.message,
            stack: this.stack
        };
    }
}

module.exports = BusinessLogicError;
