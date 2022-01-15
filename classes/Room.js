"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Room = void 0;
var BattleManager_1 = require("./BattleManager");
var Utility_1 = require("./Utility");
var Room = /** @class */ (function () {
    function Room(_roomDir, _dungeon, _coordinate, _hasBattle) {
        if (_hasBattle === void 0) { _hasBattle = false; }
        this.battle = null;
        this.treasure = null;
        this.directions = _roomDir;
        this.dungeon = _dungeon;
        this.coordinate = _coordinate;
        this.isBattleRoom = _hasBattle;
        this.isDiscovered = (0, Utility_1.findEqualCoordinate)(this.dungeon.data.start, _coordinate);
    }
    Room.prototype.StartBattle = function (_ambush) {
        var _this = this;
        if (this.battle) {
            var battleOptions = {
                ambush: _ambush,
            };
            return this.battle.StartBattle(battleOptions)
                .then(function (_r) {
                var _a;
                _this.isBattleRoom = false;
                var leader = (_a = _this.dungeon.leaderUser) === null || _a === void 0 ? void 0 : _a.id;
                if (leader) {
                    BattleManager_1.BattleManager.Manager.delete(leader);
                }
                return _r;
            });
        }
        return null;
    };
    Room.prototype.Move = function (_direction) {
    };
    return Room;
}());
exports.Room = Room;
