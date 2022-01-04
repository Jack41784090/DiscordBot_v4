"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusEffect = void 0;
var Utility_1 = require("./Utility");
var statusEffect_effects = new Map([
    [
        "bleed",
        function (_statusEffect) {
            var affected = _statusEffect.affected;
            var value = _statusEffect.value * 100;
            var returnString = "**" + affected.base.class + "** (" + affected.index + ") Bleeds! \uD83E\uDE78 -**" + value + "**";
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
]);
var StatusEffect = /** @class */ (function () {
    function StatusEffect(_type, _duration, _value, _from, _affected) {
        this.type = _type;
        this.duration = _duration;
        this.value = (0, Utility_1.clamp)(_value, 0, 1);
        this.from = _from;
        this.affected = _affected;
    }
    StatusEffect.prototype.tick = function () {
        (0, Utility_1.log)("\t\tFinding \"" + this.type + "\" (" + this.value + " for " + this.duration + ")...");
        var statusResult = "";
        var statusEffect = statusEffect_effects.get(this.type);
        if (this.duration > 0 && statusEffect) {
            (0, Utility_1.log)("\t\t\tSuccessful execution!");
            statusResult = statusEffect(this);
        }
        else {
            (0, Utility_1.log)("\t\t\tFailed to execute. Removing.");
        }
        return statusResult;
    };
    return StatusEffect;
}());
exports.StatusEffect = StatusEffect;
