'use strict';

const BusinessLogicError = require('../business-logic-error/business-logic-error');

/** @typedef {any} Resource */
/** @typedef {{ resource: Resource } & import('../business-logic-error/business-logic-error').Options} Options */

class NotFoundError extends BusinessLogicError {

    /**
     * @constructor
     * @param {Options} options -
     */
    constructor(options) {
        super(options);

        this._resource = options.resource;
    }

    get resource() {
        return this._resource;
    }

    toJSON() {
        const result = super.toJSON();

        return { resource: this._resource, ...result };
    }
}

module.exports = NotFoundError;
