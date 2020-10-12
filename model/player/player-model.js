'use strict';

class PlayerModel {

    constructor(options) {
        const {
            parameters: {
                id,
                name,
                teamId,
                managerId,
            }
        } = options;

        this._id = id;
        this._name = name;
        this._teamId = teamId;
        this._managerId = managerId;
    }
}

module.exports = PlayerModel;