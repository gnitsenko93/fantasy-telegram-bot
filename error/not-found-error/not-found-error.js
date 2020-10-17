'use strict';

const BusinessLogicError = require('../business-logic-error/business-logic-error');

/** @typedef {'manager'|'team'|'player'|'transfer'|'league'} Resource */
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

    toJSON() {
        const result = super.toJSON();

        return { resource: this._resource, ...result };
    }
}

module.exports = NotFoundError;
