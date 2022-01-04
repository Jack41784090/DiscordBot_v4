import { AttackAction, ClashResult, WeaponEffectFunction, WeaponName } from "../typedef";
import { StatusEffect } from "./StatusEffect";
import { log } from "./Utility";

const statusEffect_effects = new Map<WeaponName, WeaponEffectFunction>([
    [
        "Obliterate",
        (_aA: AttackAction, _cR: ClashResult) => {
            if (_cR.fate !== "Miss") {
                _aA.affected.statusEffects.push(new StatusEffect("bleed", 2, 0.01, _aA.from, _aA.affected));
            }
        }
    ],
    [
        "Endure",
        (_aA: AttackAction, _cR: ClashResult) => {
            _aA.affected.statusEffects.push(new StatusEffect("bleed", 2, 0.01, _aA.from, _aA.affected));
        }
    ],
]);

export class WeaponEffect {
    attackAction: AttackAction;
    clashResult: ClashResult;

    constructor(_aA: AttackAction, _cR: ClashResult) {
        this.attackAction = _aA;
        this.clashResult = _cR;
    }

    activate() {
        log(`\tActivating ${this.attackAction.weapon.Name}`);
        const weaponEffect = statusEffect_effects.get(this.attackAction.weapon.Name);
        if (weaponEffect) {
            weaponEffect(this.attackAction, this.clashResult);
        }

        return weaponEffect !== undefined;
    }
}