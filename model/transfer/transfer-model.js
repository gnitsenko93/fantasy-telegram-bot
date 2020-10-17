'use strict';

const { Logable } = require('../../lib/log');

class TransferModel extends Logable {

    constructor(options) {
        super(options);

        const {
            collection = 'transfers',
        } = options.config;

        this._collection = collection;

        this._storage = options.storage;
    }
}

module.exports = TransferModel;
