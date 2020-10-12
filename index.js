'use strict';

const { nanoid } = require('nanoid');

const config = require('./config');

const { Logger } = require('./lib/log');
const Application = require('./lib/application/application');
const { BotTransport } = require('./transport');
const { MongoStorage } = require('./storage');

const logger = new Logger();

const storage = new MongoStorage({
    logger,
    config: config.storage
});

const transport = new BotTransport({
    logger,
    storage,
    config,
});

const application = new Application({
    logger,
    storage,
    transport,
});

const traceId = nanoid();
const ctx = { traceId };
application.start(ctx)
    .catch(error => {
        logger.error(ctx, 'Error on an application start.', { error });
        process.exit(1);
    })
