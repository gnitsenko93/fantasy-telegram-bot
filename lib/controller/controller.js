'use strict';

const { nanoid } = require('nanoid');

const { Logable } = require('../log');

/** 
 * @typedef {Object} LoggingContext -
 * @property {string} traceId -
 */
/** @typedef {import('telegraf').Context} Context */
/**
 * @typedef {Object} ContextState
 * @property {import('../../service/manager/manager-service').ManagerData} [manager] -
 * @property {import('../../service/league/league-service').LeagueData} [league] -
 */
/**
 * @typedef {Object} RequestOptions
 * @property {{state: ContextState} & Context} request -
 */
/**
 * @typedef {Object} ControllerOptions
 * @property {import('../../config')} config -
 * @property {string} [command] -
 */
/** @typedef {ControllerOptions & import('../log/logable').LogableOptions} Options */

class Controller extends Logable {

    /**
     * @constructor
     * @param {Options} options -
     */
    constructor(options) {
        super(options);

        this._command = options.command;
        this._config = options.config;
    }

    /**
     * @param {Context} ctx -
     * @param {Function} next -
     * @returns {Promise<void>} -
     */
    async handler(ctx, next) {
        let traceId = ctx.state.traceId;

        if (!traceId) {
            traceId = nanoid();
            ctx.state.traceId = traceId;
        }

        const logCtx = { traceId };

        this.log(logCtx, `Processing a message through [${this.constructor.name}].`);

        try {
            await this.process(logCtx, { request: ctx });
        } catch (error) {
            this.logError(logCtx, `Error on processing a message through [${this.constructor.name}].`, { error });

            await this.processError(logCtx, { error, request: ctx });
        }
        this.log(logCtx, `A message is processed through [${this.constructor.name}].`);
        
        return next();
    }

    /**
     * @abstract
     * @param {LoggingContext} logCtx -
     * @param {{ request: Context }} options -
     * @returns {Promise<void>} -
     */
    async process(logCtx, { request }) {
        return;
    }

    /**
     * @abstract
     * @param {LoggingContext} logCtx -
     * @param {{ error: Error, request: Context }} options -
     * @returns {Promise<void>} -
     */
    async processError(logCtx, { error, request }) {
        request.reply('There is a problem with processing a message. Developers are informed and will fix it ASAP.');
        throw error;
    }

    /**
     * Gets a text from a message.
     * @description Cuts a command from a message.
     * @param {LoggingContext} logCtx -
     * @param {{ request: Context }} options -
     * @returns {string|null} -
     */
    _getText(logCtx, { request }) {
        const {
            message: {
                text,
            },
        } = request;

        if (!text) return null;

        if (!this._command) return text;

        return text.substr(`/${this._command}`.length + 1);
    }

    get command() {
        return this._command;
    }
}

module.exports = Controller;
