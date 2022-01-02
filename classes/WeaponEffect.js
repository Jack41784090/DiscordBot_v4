"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeaponEffect = void 0;
var StatusEffect_1 = require("./StatusEffect");
var Utility_1 = require("./Utility");
var statusEffect_effects = new Map([
    [
        "Obliterate",
        function (_aA) {
            _aA.affected.statusEffects.push(new StatusEffect_1.StatusEffect("bleed", 2, 0.01, _aA.from, _aA.affected));
        }
    ],
]);
var WeaponEffect = /** @class */ (function () {
    function WeaponEffect(_aA) {
        this.attackAction = _aA;
    }
    WeaponEffect.prototype.activate = function () {
        (0, Utility_1.log)("\tActivating " + this.attackAction.weapon.Name);
        var weaponEffect = statusEffect_effects.get(this.attackAction.weapon.Name);
        if (weaponEffect) {
            weaponEffect(this.attackAction);
        }
        return weaponEffect !== undefined;
    };
    return WeaponEffect;
}());
exports.WeaponEffect = WeaponEffect;
