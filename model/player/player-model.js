'use strict';

const { Logable } = require('../../lib/log');

class PlayerModel extends Logable {

    constructor(options) {
        super(options);

        const {
            collection = 'players',
        } = options.config;

        this._collection = collection;

        this._storage = options.storage;
    }
}

module.exports = PlayerModel;