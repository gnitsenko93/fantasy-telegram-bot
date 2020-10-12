'use strict';

class TransferModel {

    constructor(options) {
        const {
            parameters: {
                id,
                managerId,
                outbound,
                inbound,
            }
        } = options;

        this._id = id;
        this._managerId = managerId;
        this._outbound = outbound;
        this._inbound = inbound;
    }
}

module.exports = TransferModel;
