'use strict';

const Logable = require('../../lib/log/logable');

const { ManagerModel } = require('../../model/index');

class ManagerService extends Logable {

    constructor(options) {
        super(options);

        this._managerModel = new ManagerModel({
            ...options,
            config: {},
        });
    }

    async getByUserId(ctx, options) {
        const { userId } = options;

        const manager = await this._managerModel.load(ctx, { userId });

        if (!manager) return null;

        return manager;
    }

    async create(ctx, options) {
        const {
            userId,
            name,
        } = options;

        const manager = await this._managerModel.create(ctx, {
            name,
            userId,
        });

        return manager;
    }

    getSecret(ctx, options) {
        const {
            manager,
        } = options;

        return manager.secret;
    }

    hasLeague(ctx, options) {
        const {
            manager,
        } = options;

        return !!manager.secret;
    }

    async joinLeague(ctx, options) {
        const {
            userId,
            secret
        } = options;

        await this._managerModel.patch(ctx, { userId, patch: { secret }});
    }

    async leaveLeague(ctx, options) {
        const { userId } = options;

        await this._managerModel.patch(ctx, { userId, patch: { secret: null } });
    }
}

module.exports = ManagerService;