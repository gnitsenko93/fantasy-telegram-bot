'use strict';

class TeamModel {

    constructor(options) {
        const {
            parameters: {
                id,
                name,
                managerId,
                leagueSecret,
            }
        } = options;

        this._id = id;
        this._name = name;
        this._managerId = managerId;
        this._leagueSecret = leagueSecret;
    }
}

module.exports = TeamModel;