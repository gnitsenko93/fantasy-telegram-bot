'use strict';

const Logable = require('../../lib/log/logable');

const { LeagueModel } = require('../../model/index');

class LeagueService extends Logable {

    constructor(options) {
        super(options);

        this._leagueModel = new LeagueModel({
            ...options,
            config: {},
        });
    }

    async getByLeagueId(ctx, options) {
        const { leagueId } = options;

        const league = await this._leagueModel.load(ctx, { leagueId });

        if (!league) return null;

        return league;
    }

    async getBySecret(ctx, options) {
        const { secret } = options;

        const league = await this._leagueModel.load(ctx, { secret });

        if (!league) return null;

        return league;
    }

    async create(ctx, options) {
        const { userId, name } = options;

        const league = await this._leagueModel.create(ctx, { userId, name });

        return league;
    }
    
    getSecret(ctx, options) {
        const { league } = options;

        return league.secret;
    }
}

module.exports = LeagueService;
