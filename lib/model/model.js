'use strict';

const { Logable } = require('../log');

/**
 * @typedef {Object} ModelOptions -
 * @property {{ collection: string }} config -
 * @property {import('../../storage/mongo/mongo-storage')} storage -
 */
/** @typedef {ModelOptions & import('../log/logable').LogableOptions} Options */

class Model extends Logable {

    /**
     * @constructor
     * @param {Options} options -
     */
    constructor(options) {
        super(options);

        const {
            collection,
        } = options.config;

        this._collection = collection;

        this._storage = options.storage;
    }

}

module.exports = Model;
