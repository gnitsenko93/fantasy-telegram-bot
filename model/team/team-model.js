'use strict';

const { Logable } = require('../../lib/log');

class TeamModel extends Logable {

    constructor(options) {
        super(options);

        const {
            collection = 'teams',
        } = options.config;

        this._collection = collection;

        this._storage = options.storage;
    }

    
}

module.exports = TeamModel;