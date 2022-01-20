"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeaponEffect = void 0;
var typedef_1 = require("../typedef");
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
        "Blind Charge",
        function (_action, _cR, _bd) {
            var returnString = '';
            var attackAction = _action;
            return returnString;
        }
    ],
    [
        "Passive: Endless Labour",
        function (_action, _cR, _bd) {
            var affected = _action.from;
            var previousLabour = _bd.getStatus(affected, "labouring");
            if (previousLabour[0] === undefined) {
                affected.statusEffects.push(new StatusEffect_1.StatusEffect("labouring", 999, 0, affected, affected, _bd));
            }
            return "";
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
                furyStatus_1.value += addingValue;
                returnString += "\uD83D\uDD25 +" + (0, Utility_1.roundToDecimalPlace)(addingValue) + " Fury!";
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
                furyStatus_2.value += addingValue;
                returnString += "\uD83D\uDD25 +" + (0, Utility_1.roundToDecimalPlace)(addingValue) + " Fury!";
                _action.affected.statusEffects.push(new StatusEffect_1.StatusEffect("bleed", 1, _cR.damage * (0.25 * furyStatus_2.value / 100), _action.from, _action.affected, _bd));
            }
            return returnString;
        }
    ],
    [
        "Passive: Unrelenting Fury",
        function (_action, _cR, _bd) {
            // initialise fury status
            var attacker = _action.from;
            var furyStatus = _bd.getStatus(attacker, "fury")[0] || new StatusEffect_1.StatusEffect("fury", 999, 0, attacker, attacker, _bd);
            if (!attacker.statusEffects.some(function (_s) { return _s === furyStatus; })) {
                attacker.statusEffects.push(furyStatus);
            }
            // decrease fury
            if (_action.from.base.class === _action.affected.base.class && _action.from.index === _action.affected.index) {
                furyStatus.value -= 2;
            }
            furyStatus.value = (0, Utility_1.clamp)(furyStatus.value, 0, 100);
            return "";
        }
    ],
    [
        "Hunt",
        function (_action, _cR, _bd) {
            var returnString = "";
            if (_cR.fate !== "Miss") {
                _action.affected.readiness -= 10;
                returnString += "💦 Exhaust!";
            }
            return returnString;
        }
    ],
    [
        "Wild Hunt",
        function (_action, _cR, _bd) {
            var returnString = "";
            for (var i = 0; i < 4; i++) {
                var coord = (0, Utility_1.getNewObject)(_action.from);
                var numDir = i;
                var dir = (0, Utility_1.numericDirectionToDirection)(numDir);
                var magAxis = (0, Utility_1.directionToMagnitudeAxis)(dir);
                coord[magAxis.axis] += magAxis.magnitude;
                if (_bd.findEntity_coord(coord) === undefined) {
                    var wolf = (0, Utility_1.getStat)((0, Utility_1.getBaseEnemyStat)("Diana's Wolf"));
                    wolf.team = 'player';
                    _bd.Spawn(wolf, coord);
                    returnString += "🐺";
                }
            }
            return returnString;
        }
    ],
    [
        "Slay",
        function (_action, _cR, _bd) {
            var returnString = '';
            var target = _action.affected;
            if (_cR.fate !== "Miss" && (target.HP / target.base.AHP) <= (1 / 3)) {
                _cR.damage = _cR.damage * 1.5;
                _cR.u_damage = _cR.u_damage * 1.5;
                returnString += 'x1.5❗❗';
            }
            return returnString;
        }
    ],
    [
        "Attack-Order",
        function (_action, _cR, _bd) {
            var returnString = "+🗡️";
            var swords = _action.from.sword;
            if (swords > 0) {
                _action.affected.sword++;
                _action.from.sword--;
                returnString += typedef_1.EMOJI_SWORD;
            }
            _action.affected.sword++;
            return returnString;
        }
    ],
    [
        "Defence-Order",
        function (_action, _cR, _bd) {
            var returnString = "+🛡️";
            var shields = _action.from.shield;
            if (shields > 0) {
                _action.affected.shield++;
                _action.from.shield--;
                returnString += typedef_1.EMOJI_SHIELD;
            }
            _action.affected.shield++;
            return returnString;
        }
    ],
    [
        "Manoeuvre-Order",
        function (_action, _cR, _bd) {
            var returnString = "+👢";
            var sprints = _action.from.sprint;
            if (sprints > 0) {
                _action.affected.sprint++;
                _action.from.sprint--;
                returnString += '👢';
            }
            _action.affected.sprint++;
            return returnString;
        }
    ],
    [
        "Slice",
        function (_action, _cR, _bd) {
            var returnString = "";
            var sprints = _action.from.sprint;
            if (sprints > 0) {
                _cR.damage += sprints;
                _cR.u_damage += sprints;
                returnString += " (+" + sprints + ")";
                _action.from.sprint--;
            }
            return returnString;
        }
    ],
    [
        "Angelic Blessings",
        function (_action, _cR, _bd) {
            var returnString = "";
            var attacker = _action.from;
            var target = _action.affected;
            returnString += target.base.class + " (" + target.index + "): " + _bd.heal(target, 10) + " +👢";
            returnString += "\n" + attacker.base.class + " (" + attacker.index + "): " + _bd.heal(attacker, 10) + " +👢";
            attacker.sprint++;
            target.sprint++;
            return returnString;
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
