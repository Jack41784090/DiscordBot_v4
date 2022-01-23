"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AI = void 0;
var typedef_1 = require("../typedef");
var Utility_1 = require("./Utility");
var AIFunctions = new Map([
    [
        typedef_1.BotType.approach_attack,
        function (_rS, _bd) {
            var _a;
            (0, Utility_1.log)("Employing approach_attack AI");
            var virtualStat = (0, Utility_1.getNewObject)(_rS, { virtual: true });
            // target selection: attack closest
            var intendedTargets = ["block"];
            if (virtualStat.team) {
                intendedTargets.push(virtualStat.team);
            }
            var selectedTarget = _bd.findEntity_closest(virtualStat, intendedTargets);
            // if found a target
            if (selectedTarget !== null) {
                // 1. select weapon
                var weaponSelected = virtualStat.base.weapons[0];
                // 2. move to preferred location
                var path = _bd.startPathFinding(_rS, selectedTarget, "lowest");
                var moveActionArray = _bd.getMoveActionListFromCoordArray(_rS, path);
                var fullActions = _bd.normaliseMoveActions(moveActionArray, virtualStat);
                // 3. attack with selected weapon
                if ((0, Utility_1.checkWithinDistance)(weaponSelected, (0, Utility_1.getDistance)(virtualStat, selectedTarget))) {
                    var attackAction = (0, Utility_1.getAttackAction)(virtualStat, selectedTarget, weaponSelected, selectedTarget, fullActions.length + 1);
                    var valid = _bd.executeVirtualAttack(attackAction, virtualStat);
                    if (valid) {
                        fullActions.push((0, Utility_1.getAttackAction)(_rS, selectedTarget, weaponSelected, selectedTarget, fullActions.length + 1));
                    }
                }
                (_a = _bd.roundActionsArray).push.apply(_a, __spreadArray([], __read(fullActions), false));
            }
        }
    ],
    [
        typedef_1.BotType.passive_supportive,
        function (_rS, _bd) {
            var _a;
            (0, Utility_1.log)("Employing passive_supportive AI");
            var virtualStat = (0, Utility_1.getNewObject)(_rS);
            var allActions = [];
            var ability = (0, Utility_1.getRandomInArray)(virtualStat.base.weapons.filter(function (_w) { return _w.targetting.target === typedef_1.WeaponTarget.ally; }));
            // execute ally-targetting ability
            var AOE = ability.targetting.AOE;
            switch (AOE) {
                case 'selfCircle':
                    // move to best place
                    var blastRange_1 = ability.Range[2];
                    var movesAvailable_1 = 1 + virtualStat.sprint;
                    (0, Utility_1.debug)("movesAvailable", movesAvailable_1);
                    var domain_1 = _bd.findEntities_radius(virtualStat, movesAvailable_1 + blastRange_1, false);
                    var mostOccupants_1 = 0;
                    var optimalLocation_1 = { x: virtualStat.x, y: virtualStat.y };
                    var coordMap_1 = new Map();
                    // breadth search out to find an empty space that can hit the most allies
                    (0, Utility_1.breadthFirstSearch)({ x: virtualStat.x, y: virtualStat.y }, function (_c) {
                        var result = [];
                        for (var i = 0; i < 4; i++) {
                            // new coordinate
                            var newCoord = { x: _c.x, y: _c.y };
                            var numDir = i;
                            var magAxis = (0, Utility_1.directionToMagnitudeAxis)(numDir);
                            newCoord[magAxis.axis] += magAxis.magnitude;
                            // save coord obj ref for exploredRoom.include in breadthSearch to function
                            var coordString = (0, Utility_1.getCoordString)(newCoord);
                            var coord = coordMap_1.get(coordString) ||
                                newCoord;
                            coordMap_1.set(coordString, coord);
                            // space occupied?
                            //  null: empty-space-coord;
                            result.push(_bd.CSMap.get(coordString) || !_bd.checkWithinWorld(coord) ?
                                null :
                                coord);
                        }
                        return result;
                    }, function (_q, _c) {
                        // debug(`@${_c.x},${_c.y} distance`, getDistance(_c, _rS));
                        return (0, Utility_1.getDistance)(_c, virtualStat) < movesAvailable_1;
                    }, function (_c) {
                        var affected = _bd.findEntities_radius(_c, blastRange_1, false, typedef_1.AllTeams.filter(function (_t) { return _t !== virtualStat.team; }), domain_1);
                        // debug(`@${_c.x},${_c.y}`, affected.length)
                        if (affected.length > mostOccupants_1) {
                            optimalLocation_1 = _c;
                            mostOccupants_1 = affected.length;
                        }
                        return false;
                    });
                    (0, Utility_1.debug)("optimalLocation", optimalLocation_1);
                    var pathToBuffing = _bd.startPathFinding(virtualStat, optimalLocation_1, "lowest");
                    allActions.push.apply(allActions, __spreadArray([], __read(_bd.normaliseMoveActions(_bd.getMoveActionListFromCoordArray(virtualStat, pathToBuffing), virtualStat)), false));
                    break;
                case 'touch':
                    break;
            }
            // run away from danger if possible
            virtualStat.sprint += 3;
            if (!virtualStat.moved || (virtualStat.sprint > 0)) {
                var coordMap_2 = new Map();
                var reachableEnemiesCoordinates = (0, Utility_1.breadthFirstSearch)({ x: virtualStat.x, y: virtualStat.y }, function (_c) {
                    var result = [];
                    for (var i = 0; i < 4; i++) {
                        // new coordinate
                        var newCoord = { x: _c.x, y: _c.y };
                        var numDir = i;
                        var magAxis = (0, Utility_1.directionToMagnitudeAxis)(numDir);
                        newCoord[magAxis.axis] += magAxis.magnitude;
                        // save coord obj ref for exploredRoom.include in breadthSearch to function
                        var coordString = (0, Utility_1.getCoordString)(newCoord);
                        var coord = coordMap_2.get(coordString) ||
                            newCoord;
                        coordMap_2.set(coordString, coord);
                        result.push(_bd.checkWithinWorld(coord) ?
                            coord :
                            null);
                    }
                    (0, Utility_1.log)(result);
                    return result;
                }, function (_q, _c) {
                    (0, Utility_1.debug)("ra: @" + _c.x + "," + _c.y + " distance", (0, Utility_1.getDistance)(_c, virtualStat));
                    return (0, Utility_1.getDistance)(_c, virtualStat) < 3;
                }, function (_c) {
                    var character = _bd.CSMap.get((0, Utility_1.getCoordString)(_c)) || null;
                    return character !== null && character.team !== 'block' && character.team !== virtualStat.team;
                });
                if (reachableEnemiesCoordinates.length > 0) {
                    var runAwayFromCoord = {
                        x: Utility_1.average.apply(void 0, __spreadArray([], __read(reachableEnemiesCoordinates.map(function (_c) { return _c.x; })), false)),
                        y: Utility_1.average.apply(void 0, __spreadArray([], __read(reachableEnemiesCoordinates.map(function (_c) { return _c.y; })), false)),
                    };
                    (0, Utility_1.debug)("run away from", runAwayFromCoord);
                    var path = _bd.startPathFinding(virtualStat, runAwayFromCoord, "highest", (0, Utility_1.average)(_bd.width, _bd.height));
                    var actions = _bd.getMoveActionListFromCoordArray(virtualStat, path);
                    var escapingActions = _bd.normaliseMoveActions(actions, virtualStat);
                    allActions.push.apply(allActions, __spreadArray([], __read(escapingActions), false));
                }
            }
            (_a = _bd.roundActionsArray).push.apply(_a, __spreadArray([], __read(allActions), false));
        }
    ]
]);
var AI = /** @class */ (function () {
    function AI(_stat, _bT, _bd) {
        this.stat = _stat;
        this.type = _bT;
        this.battleData = _bd;
    }
    AI.prototype.activate = function () {
        var fnc = AIFunctions.get(this.type);
        if (fnc) {
            fnc(this.stat, this.battleData);
        }
    };
    return AI;
}());
exports.AI = AI;
