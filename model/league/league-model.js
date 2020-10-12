'use strict';

const { v4: uuid } = require('uuid');

const { Logable } = require('../../lib/log');

class LeagueModel extends Logable {

    constructor(options) {
        super(options);

        const {
            collection = 'leagues',
        } = options.config;

        this._collection = collection;

        this._storage = options.storage;
    }

    async load(ctx, options) {
        try {
            const { secret } = options;

            this.logDebug(ctx, 'Loading a league.', { secret });

            const league = await this._storage.get(ctx, { 
                query: { secret }, collection: this._collection,
            });

            if (!league) {
                this.logWarn(ctx, 'A league is not found.');

                return null;
            }

            this.logDebug(ctx, 'A league is loaded.', { league });

            return league;
        } catch (error) {
            this.logError(ctx, 'Error on loading a league.', { error });
            throw error;
        }
    }

    async create(ctx, options) {
        const { userId, name } = options;

        const secret = uuid();

        const league = await this._storage.set(ctx, {
            value: { userId, name, secret }, 
            collection: this._collection,
        });

        return league;
    }
}

module.exports = LeagueModel;