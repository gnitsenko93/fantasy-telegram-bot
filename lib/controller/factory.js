'use strict';

function controllerFactory(ControllerConstructor, ...args) {
    const controller = Reflect.construct(ControllerConstructor, args);
    return controller.handler.bind(controller);
}

module.exports = controllerFactory;