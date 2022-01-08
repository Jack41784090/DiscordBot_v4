"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeaponEffect = void 0;
var StatusEffect_1 = require("./StatusEffect");
var Utility_1 = require("./Utility");
var statusEffect_effects = new Map([
    [
        "Obliterate",
        function (_action, _cR, _bd) {
            if (_cR.fate !== "Miss" && _cR.damage > 14) {
                _action.affected.shield--;
                return "\uD83E\uDE93 Shield break!";
            }
            return "";
        }
    ],
    [
        "Endure",
        function (_action, _cR, _bd) {
            var returnString = "";
            var affected = _action.affected;
            var labourStatus = _bd.getStatus(affected, "labouring");
            if (labourStatus[0]) {
                var damageTaken = labourStatus[0].value;
                returnString += _bd.heal(affected, damageTaken * 0.33);
                affected.statusEffects.push(new StatusEffect_1.StatusEffect("protected", 2, damageTaken * 0.33, _action.from, _action.affected, _bd));
                labourStatus[0].value -= damageTaken * 0.33;
                returnString += "\n__Endure__: Shielded! (**" + (0, Utility_1.roundToDecimalPlace)(damageTaken * 0.33) + "**)";
            }
            return returnString;
        }
    ],
    [
        "Endless Labour",
        function (_action, _cR, _bd) {
            var affected = _action.from;
            var previousLabour = _bd.getStatus(affected, "labouring");
            if (previousLabour[0] === undefined) {
                affected.statusEffects.push(new StatusEffect_1.StatusEffect("labouring", 999, 0, affected, affected, _bd));
            }
            return "Hercules: __**Endless Labour**__";
        }
    ],
    [
        "Vicious Stab",
        function (_action, _cR, _bd) {
            var returnString = '';
            if (_cR.fate !== "Miss") {
                var attacker = _action.from;
                var furyStatus_1 = _bd.getStatus(attacker, "fury")[0] || new StatusEffect_1.StatusEffect("fury", 999, 0, attacker, attacker, _bd);
                if (!attacker.statusEffects.some(function (_s) { return _s === furyStatus_1; })) {
                    attacker.statusEffects.push(furyStatus_1);
                }
                var addingValue = 0;
                addingValue += _cR.damage;
                if (_action.affected.HP - _cR.damage <= 0) {
                    addingValue += 10;
                }
                returnString += "\uD83D\uDD25 +" + addingValue + " Fury!";
                _action.affected.statusEffects.push(new StatusEffect_1.StatusEffect("bleed", 1, _cR.damage * (0.33 * furyStatus_1.value / 100), _action.from, _action.affected, _bd));
            }
            return returnString;
        }
    ],
    [
        "Decimate",
        function (_action, _cR, _bd) {
            var returnString = '';
            if (_cR.fate !== "Miss") {
                var attacker = _action.from;
                var furyStatus_2 = _bd.getStatus(attacker, "fury")[0] || new StatusEffect_1.StatusEffect("fury", 999, 0, attacker, attacker, _bd);
                if (!attacker.statusEffects.some(function (_s) { return _s === furyStatus_2; })) {
                    attacker.statusEffects.push(furyStatus_2);
                }
                var addingValue = 0;
                addingValue += _cR.damage;
                if (_action.affected.HP - _cR.damage <= 0) {
                    addingValue += 10;
                }
                returnString += "\uD83D\uDD25 +" + addingValue + " Fury!";
                _action.affected.statusEffects.push(new StatusEffect_1.StatusEffect("bleed", 1, _cR.damage * (0.25 * furyStatus_2.value / 100), _action.from, _action.affected, _bd));
            }
            return returnString;
        }
    ],
    [
        "Unrelenting Fury",
        function (_action, _cR, _bd) {
            // initialise fury status
            var attacker = _action.from;
            var furyStatus = _bd.getStatus(attacker, "fury")[0] || new StatusEffect_1.StatusEffect("fury", 999, 0, attacker, attacker, _bd);
            if (!attacker.statusEffects.some(function (_s) { return _s === furyStatus; })) {
                attacker.statusEffects.push(furyStatus);
            }
            // decrease fury
            if (_action.from.base.class === _action.affected.base.class && _action.from.index === _action.affected.index) {
                furyStatus.value -= 5;
            }
            furyStatus.value = (0, Utility_1.clamp)(furyStatus.value, 0, 100);
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
