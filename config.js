'use strict';

const convict = require('convict');

const config = convict({
    token: {
        format: String,
        default: '',
    },
    storage: {
        url: {
            format: String,
            default: '',
        },
        options: {
            format: Object,
            default: {},
        }
    },
    options: {
        enableManagerCreationWithoutSecret: {
            format: Boolean,
            default: false,
        },
        transfersCount: {
            format: Number,
            default: 3,
        },
    },
});

config.loadFile('./config/config.json');
config.loadFile('./config/development.json');

config.validate({
    allowed: 'strict',
});

module.exports = config.get();
