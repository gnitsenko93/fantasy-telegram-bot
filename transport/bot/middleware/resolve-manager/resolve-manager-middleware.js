'use strict';

const { Controller } = require('../../../../lib/controller');

class ResolveManagerMiddleware extends Controller {

    constructor(options) {
        super(options);

        this._managerService = options.managerService;
    }

    async process(ctx, { request }) {
        const {
            from: {
                id: userId,
            },
        } = request;

        this.log(ctx, 'Resolving a manager by userId.', { userId });

        let manager = await this._managerService.getByUserId(ctx, { userId });

        if (manager === null) {
            this.logDebug(ctx, 'A user is a new one.', { userId });

            manager = await this._managerService.create(ctx, {
                userId,
                name: request.from.username,
            });
        }

        this.log(ctx, 'A manager is resolved.', { userId });

        request.state.manager = manager;
    }
}

module.exports = ResolveManagerMiddleware;
