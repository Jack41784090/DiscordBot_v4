"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusEffect = void 0;
var Utility_1 = require("./Utility");
var statusEffect_effects = new Map([
    [
        "bleed",
        function (_statusEffect, _sameRound_action, _bd) {
            var affected = _statusEffect.affected;
            var value = _statusEffect.value;
            var returnString = "";
            if (value > 0) {
                returnString += "Bleeds! \uD83E\uDE78 -**" + (0, Utility_1.roundToDecimalPlace)(value) + "** (x" + _statusEffect.duration + ")";
                affected.HP -= value;
                if (affected.HP + value > 0 && affected.HP <= 0) {
                    returnString += "\n__**KILLING BLOW!**__";
                }
                else if (affected.HP <= 0) {
                    returnString += " (*Overkill*)";
                }
                _statusEffect.duration--;
            }
            return returnString;
        }
    ],
    [
        "protected",
        function (_statusEffect, _sameRound_action, _bd) {
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
        function (_statusEffect, _sameRound_action, _bd) {
            var value = (0, Utility_1.clamp)(_statusEffect.value, 0, 100);
            _statusEffect.value = value;
            var returnString = "Endures the pain... \uD83D\uDC77 (**" + (0, Utility_1.roundToDecimalPlace)(value) + "**)";
            _statusEffect.duration--;
            return returnString;
        }
    ],
    [
        "fury",
        function (_statusEffect, _sameRound_action, _bd) {
            var affected = _statusEffect.affected;
            var value = (0, Utility_1.clamp)(_statusEffect.value, 0, 100);
            _statusEffect.value = value;
            var fullFury = 100;
            var returnString = "";
            if (value > 66) {
                returnString += "**ENRAGED**! ( " + value + "/" + fullFury + " )";
                if (affected.buffs.damageRange < 5) {
                    affected.buffs.damageRange = 5;
                }
                if (affected.buffs.lifesteal < 0.2) {
                    affected.buffs.lifesteal = 0.2;
                }
            }
            else {
                returnString += "Growing in rage... ( " + value + "/" + fullFury + " )";
                _bd.removeBuffStatus(_statusEffect.affected, 5, "damageRange");
                _bd.removeBuffStatus(_statusEffect.affected, 0.2, "lifesteal");
            }
            return returnString;
        }
    ],
    [
        "DamageUp",
        function (_statusEffect, _sameRound_action, _bd) {
            var value = _statusEffect.value;
            var returnString = "";
            if (value > 0) {
                returnString += "damageRange Up! \uD83D\uDCAA (**" + (0, Utility_1.roundToDecimalPlace)(value) + "**)";
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
            statusResult = statusEffect(this, _action, this.battleData);
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
