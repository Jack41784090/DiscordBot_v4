"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbilityEffect = void 0;
var typedef_1 = require("../typedef");
var StatusEffect_1 = require("./StatusEffect");
var Utility_1 = require("./Utility");
var console_1 = require("console");
var statusEffect_effects = new Map([
    [
        "Obliterate",
        function (_action, _cR, _bd) {
            if (_cR.fate !== "Miss" && _cR.damage > 14) {
                _action.target.shield--;
                return "\uD83E\uDE93 Shield break!";
            }
            return "";
        }
    ],
    [
        "Endure",
        function (_action, _cR, _bd) {
            var returnString = "";
            var affected = _action.target;
            var labourStatus = _bd.getStatus(affected, "labouring");
            if (labourStatus[0]) {
                var damageTaken = labourStatus[0].value;
                returnString += _bd.heal(affected, damageTaken * 0.33);
                affected.statusEffects.push(new StatusEffect_1.StatusEffect("protected", 2, damageTaken * 0.33, _action.attacker, _action.target, _bd));
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
            var affected = _action.attacker;
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
                var attacker = _action.attacker;
                var furyStatus_1 = _bd.getStatus(attacker, "fury")[0] || new StatusEffect_1.StatusEffect("fury", 999, 0, attacker, attacker, _bd);
                if (!attacker.statusEffects.some(function (_s) { return _s === furyStatus_1; })) {
                    attacker.statusEffects.push(furyStatus_1);
                }
                var addingValue = 0;
                addingValue += _cR.damage;
                if (_action.target.HP - _cR.damage <= 0) {
                    addingValue += 10;
                }
                furyStatus_1.value += addingValue;
                returnString += "\uD83D\uDD25 +" + (0, Utility_1.roundToDecimalPlace)(addingValue) + " Fury!";
                _action.target.statusEffects.push(new StatusEffect_1.StatusEffect("bleed", 1, _cR.damage * (0.33 * furyStatus_1.value / 100), _action.attacker, _action.target, _bd));
            }
            return returnString;
        }
    ],
    [
        "Decimate",
        function (_action, _cR, _bd) {
            var returnString = '';
            if (_cR.fate !== "Miss") {
                var attacker = _action.attacker;
                var furyStatus_2 = _bd.getStatus(attacker, "fury")[0] || new StatusEffect_1.StatusEffect("fury", 999, 0, attacker, attacker, _bd);
                if (!attacker.statusEffects.some(function (_s) { return _s === furyStatus_2; })) {
                    attacker.statusEffects.push(furyStatus_2);
                }
                var addingValue = 0;
                addingValue += _cR.damage;
                if (_action.target.HP - _cR.damage <= 0) {
                    addingValue += 10;
                }
                furyStatus_2.value += addingValue;
                returnString += "\uD83D\uDD25 +" + (0, Utility_1.roundToDecimalPlace)(addingValue) + " Fury!";
                _action.target.statusEffects.push(new StatusEffect_1.StatusEffect("bleed", 1, _cR.damage * (0.25 * furyStatus_2.value / 100), _action.attacker, _action.target, _bd));
            }
            return returnString;
        }
    ],
    [
        "Passive: Unrelenting Fury",
        function (_action, _cR, _bd) {
            // initialise fury status
            var attacker = _action.attacker;
            var furyStatus = _bd.getStatus(attacker, "fury")[0] || new StatusEffect_1.StatusEffect("fury", 999, 0, attacker, attacker, _bd);
            if (!attacker.statusEffects.some(function (_s) { return _s === furyStatus; })) {
                attacker.statusEffects.push(furyStatus);
            }
            // decrease fury
            if (_action.attacker.base.class === _action.target.base.class && _action.attacker.index === _action.target.index) {
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
                _action.target.readiness -= 3;
                returnString += "💦 Exhaust!";
            }
            return returnString;
        }
    ],
    [
        "Wild Hunt",
        function (_action, _cR, _bd) {
            var returnString = "";
            // for (let i = 0; i < 4; i++) {
            //     const coord: Coordinate = getNewObject(_action.attacker);
            //     const numDir: NumericDirection = i;
            //     const dir: Direction = numericDirectionToDirection(numDir);
            //     const magAxis = translateDirectionToMagnitudeAxis(dir);
            //     coord[magAxis.axis] += magAxis.magnitude;
            //     if (_bd.findEntity_coord(coord) === undefined) {
            //         getStat(getBaseEnemyStat("Diana's Wolf")).then(wolf => {
            //             wolf.team = 'player';
            //             _bd.Spawn(wolf, coord);
            //             returnString += "🐺"
            //         })
            //     }
            // }
            return returnString;
        }
    ],
    [
        "Slay",
        function (_action, _cR, _bd) {
            var returnString = '';
            var target = _action.target;
            if (_cR.fate !== "Miss" && (target.HP / target.base.maxHP) <= (1 / 3)) {
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
            var swords = _action.attacker.sword;
            if (swords > 0) {
                _action.target.sword++;
                _action.attacker.sword--;
                returnString += typedef_1.EMOJI_SWORD;
            }
            _action.target.sword++;
            return returnString;
        }
    ],
    [
        "Defence-Order",
        function (_action, _cR, _bd) {
            var returnString = "+🛡️";
            var shields = _action.attacker.shield;
            if (shields > 0) {
                _action.target.shield++;
                _action.attacker.shield--;
                returnString += typedef_1.EMOJI_SHIELD;
            }
            _action.target.shield++;
            return returnString;
        }
    ],
    [
        "Manoeuvre-Order",
        function (_action, _cR, _bd) {
            var returnString = "+👢";
            var sprints = _action.attacker.sprint;
            if (sprints > 0) {
                _action.target.sprint++;
                _action.attacker.sprint--;
                returnString += '👢';
            }
            _action.target.sprint++;
            return returnString;
        }
    ],
    [
        "Slice",
        function (_action, _cR, _bd) {
            var returnString = "";
            var sprints = _action.attacker.sprint;
            if (sprints > 0) {
                _cR.damage += sprints;
                _cR.u_damage += sprints;
                returnString += " (+" + sprints + ")";
                _action.attacker.sprint--;
            }
            return returnString;
        }
    ],
    [
        "Angelic Blessings",
        function (_action, _cR, _bd) {
            var returnString = "";
            var attacker = _action.attacker;
            var target = _action.target;
            returnString += target.base.class + " (" + target.index + "): " + _bd.heal(target, 10) + " +👢";
            returnString += "\n" + attacker.base.class + " (" + attacker.index + "): " + _bd.heal(attacker, 10) + " +👢";
            attacker.sprint++;
            target.sprint++;
            return returnString;
        }
    ],
]);
var AbilityEffect = /** @class */ (function () {
    function AbilityEffect(_aA, _cR, _bd) {
        this.attackAction = _aA;
        this.clashResult = _cR;
        this.battleData = _bd;
    }
    AbilityEffect.prototype.activate = function () {
        (0, console_1.log)("\tActivating " + this.attackAction.ability.abilityName);
        var returnString = "";
        var weaponEffect = statusEffect_effects.get(this.attackAction.ability.abilityName);
        if (weaponEffect) {
            returnString += weaponEffect(this.attackAction, this.clashResult, this.battleData);
        }
        return returnString;
    };
    return AbilityEffect;
}());
exports.AbilityEffect = AbilityEffect;
