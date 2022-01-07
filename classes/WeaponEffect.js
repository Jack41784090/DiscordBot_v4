"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeaponEffect = void 0;
var StatusEffect_1 = require("./StatusEffect");
var Utility_1 = require("./Utility");
var statusEffect_effects = new Map([
    [
        "Obliterate",
        function (_aA, _cR, _bd) {
            if (_cR.fate !== "Miss") {
                _aA.affected.statusEffects.push(new StatusEffect_1.StatusEffect("bleed", 2, 0.01, _aA.from, _aA.affected));
                return "__Obliterate__ bleeds the enemy!";
            }
            return "";
        }
    ],
    [
        "Endure",
        function (_aA, _cR, _bd) {
            var returnString = "";
            var affected = _aA.affected;
            var labourStatus = _bd.getStatus(affected, "labouring");
            if (labourStatus[0]) {
                var damageTaken = labourStatus[0].value * 1000;
                returnString += _bd.heal(affected, damageTaken * 0.33);
                affected.statusEffects.push(new StatusEffect_1.StatusEffect("protected", 2, damageTaken * 0.33, _aA.from, _aA.affected));
            }
            return returnString + "__Endure__: Shielded!";
        }
    ],
    [
        "Endless Labour",
        function (_aA, _cR, _bd) {
            var affected = _aA.affected;
            var previousLabour = _bd.getStatus(affected, "labouring");
            if (previousLabour[0] === undefined) {
                affected.statusEffects.push(new StatusEffect_1.StatusEffect("labouring", 999, 0, affected, affected));
            }
            return "Hercules: __**Endless Labour**__";
        }
    ],
    [
        "Vicious Stab",
        function (_aA, _cR, _bd) {
            return "";
        }
    ],
    [
        "Decimate",
        function (_aA, _cR, _bd) {
            return "";
        }
    ],
    [
        "Unrelenting Fury",
        function (_aA, _cR, _bd) {
            return "";
        }
    ],
]);
var WeaponEffect = /** @class */ (function () {
    function WeaponEffect(_aA, _cR, _bd) {
        this.attackAction = _aA;
        this.clashResult = _cR;
        this.battleData = _bd;
    }
    WeaponEffect.prototype.activate = function () {
        (0, Utility_1.log)("\tActivating " + this.attackAction.weapon.Name);
        var returnString = "";
        var weaponEffect = statusEffect_effects.get(this.attackAction.weapon.Name);
        if (weaponEffect) {
            returnString += weaponEffect(this.attackAction, this.clashResult, this.battleData);
        }
        return returnString;
    };
    return WeaponEffect;
}());
exports.WeaponEffect = WeaponEffect;
