"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusEffect = void 0;
var Utility_1 = require("./Utility");
var statusEffect_effects = new Map([
    [
        "bleed",
        function (_statusEffect, _sameRound_action) {
            var affected = _statusEffect.affected;
            var value = _statusEffect.value;
            var returnString = "Bleeds! \uD83E\uDE78 -**" + (0, Utility_1.roundToDecimalPlace)(value) + "** (x" + _statusEffect.duration + ")";
            affected.HP -= value;
            _statusEffect.duration--;
            if (affected.HP + value > 0 && affected.HP <= 0) {
                returnString += "\n__**KILLING BLOW!**__";
            }
            else if (affected.HP <= 0) {
                returnString += " (*Overkill*)";
            }
            return returnString;
        }
    ],
    [
        "protected",
        function (_statusEffect, _sameRound_action) {
            var value = (0, Utility_1.clamp)(_statusEffect.value, 0, _statusEffect.affected.base.AHP);
            _statusEffect.value = value;
            var returnString = "";
            if (value > 0) {
                returnString += "Shielded! \uD83D\uDEE1\uFE0F (**" + (0, Utility_1.roundToDecimalPlace)(value) + "**)";
                if (_sameRound_action.type === "Attack") {
                    returnString += " (x" + _statusEffect.duration + ")";
                    _statusEffect.duration--;
                }
            }
            return returnString;
        }
    ],
    [
        "labouring",
        function (_statusEffect, _sameRound_action) {
            var value = (0, Utility_1.clamp)(_statusEffect.value, 0, 100);
            _statusEffect.value = value;
            var returnString = "Endures the pain... \uD83D\uDC77 (**" + (0, Utility_1.roundToDecimalPlace)(value) + "**)";
            _statusEffect.duration--;
            return returnString;
        }
    ],
    [
        "fury",
        function (_statusEffect, _sameRound_action) {
            var affected = _statusEffect.affected;
            var value = (0, Utility_1.clamp)(_statusEffect.value, 0, 100);
            _statusEffect.value = value;
            var fullBar = 12;
            var fullFury = 100;
            var returnString = "**" + affected.base.class + "** (" + affected.index + ")";
            if (value > 66) {
                returnString += " is **ENRAGED**! ( `" + (0, Utility_1.addHPBar)(fullBar, value * fullBar / fullFury) + "` )";
                if (affected.buffs.Damage < 5) {
                    affected.buffs.Damage = 5;
                }
            }
            else {
                returnString += " is growing in rage... ( `" + (0, Utility_1.addHPBar)(fullBar, value * fullBar / fullFury) + "` )";
                // check if damage buff is 5
                if (affected.buffs.Damage === 5) {
                    // is 5, check if there are other buffs that is giving the same buff
                    var otherDamageUpBuffs = _statusEffect.battleData.getStatus(affected, "damageUp");
                    if (!otherDamageUpBuffs.find(function (_se) { return _se.value === 5; })) {
                        // if no, remove buff, find other buffs that give damage buff
                        affected.buffs.Damage = 0;
                        if (otherDamageUpBuffs.length > 0) {
                            var largestDamageUpBuff = (0, Utility_1.getLargestInArray)(otherDamageUpBuffs, function (_se) { return _se.value; });
                            affected.buffs.Damage = largestDamageUpBuff.value;
                        }
                    }
                    else {
                        // if yes, ignore
                    }
                }
                else {
                    // is not 5, buff is most probably more than 5. Ignore.
                }
            }
            return returnString;
        }
    ],
    [
        "damageUp",
        function (_statusEffect, _sameRound_action) {
            var value = _statusEffect.value;
            var returnString = "";
            if (value > 0) {
                returnString += "Damage Up! \uD83D\uDCAA (**" + (0, Utility_1.roundToDecimalPlace)(value) + "**)";
                if (_sameRound_action.type === "Attack") {
                    returnString += "(x" + _statusEffect.duration + ")";
                    _statusEffect.duration--;
                }
            }
            return returnString;
        }
    ],
]);
var StatusEffect = /** @class */ (function () {
    function StatusEffect(_type, _duration, _value, _from, _affected, _bd) {
        (0, Utility_1.log)("\t\t\tConstructed new Status: " + _type + ", " + _value + " for " + _duration + " rounds");
        this.type = _type;
        this.duration = _duration;
        this.from = _from;
        this.affected = _affected;
        this.value = _value;
        this.battleData = _bd;
    }
    StatusEffect.prototype.tick = function (_action) {
        (0, Utility_1.log)("\t\tFinding \"" + this.type + "\" (" + this.value + " for " + this.duration + ")...");
        var statusResult = "";
        var statusEffect = statusEffect_effects.get(this.type);
        if (this.duration > 0 && statusEffect) {
            (0, Utility_1.log)("\t\t\tSuccessful execution!");
            statusResult = statusEffect(this, _action);
        }
        else {
            (0, Utility_1.log)("\t\t\tFailed to execute. Removing.");
        }
        return statusResult;
    };
    StatusEffect.prototype.exit = function (_action) {
    };
    return StatusEffect;
}());
exports.StatusEffect = StatusEffect;
