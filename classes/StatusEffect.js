"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusEffect = void 0;
var Utility_1 = require("./Utility");
var statusEffect_effects = new Map([
    [
        "bleed",
        function (_statusEffect, _sameRound_action) {
            var affected = _statusEffect.affected;
            var value = _statusEffect.value * 100;
            var returnString = "**" + affected.base.class + "** (" + affected.index + ") Bleeds! \uD83E\uDE78 -**" + value + "** (x" + _statusEffect.duration + ")";
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
            var affected = _statusEffect.affected;
            var value = _statusEffect.value * 100;
            var returnString = "";
            if (value > 0) {
                returnString += "**" + affected.base.class + "** (" + affected.index + ") is Protected! \uD83D\uDEE1\uFE0F (**" + (0, Utility_1.roundToDecimalPlace)(value) + "**)";
                if (_sameRound_action.type === "Attack") {
                    returnString += "\nProtection duration: " + _statusEffect.duration;
                    _statusEffect.duration--;
                }
            }
            return returnString;
        }
    ],
    [
        "labouring",
        function (_statusEffect, _sameRound_action) {
            var affected = _statusEffect.affected;
            var value = _statusEffect.value * 1000;
            var returnString = "**" + affected.base.class + "** (" + affected.index + ") Labours... \uD83D\uDC77 (Damage Taken: **" + (0, Utility_1.roundToDecimalPlace)(value) + "**)";
            _statusEffect.duration--;
            return returnString;
        }
    ],
    [
        "fury",
        function (_statusEffect, _sameRound_action) {
            var affected = _statusEffect.affected;
            var value = _statusEffect.value * 100;
            var returnString = "**" + affected.base.class + "** (" + affected.index + ")";
            if (value > 0.66) {
                returnString += " is **ENRAGED**! ( " + (0, Utility_1.addHPBar)(100, value) + " )";
                if (affected.buffs.Damage < 5) {
                    affected.buffs.Damage = 5;
                }
            }
            else {
                returnString += " is growing in rage... ( " + (0, Utility_1.addHPBar)(100, value) + " )";
            }
            return returnString;
        }
    ],
]);
var StatusEffect = /** @class */ (function () {
    function StatusEffect(_type, _duration, _value, _from, _affected) {
        (0, Utility_1.log)("\t\t\tConstructed new Status: " + _type + ", " + _value + " for " + _duration + " rounds");
        this.type = _type;
        this.duration = _duration;
        this.value = (0, Utility_1.clamp)(_value, 0, 1);
        this.from = _from;
        this.affected = _affected;
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
