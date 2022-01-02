import { AttackAction, WeaponEffectFunction, WeaponName } from "../typedef";
import { StatusEffect } from "./StatusEffect";
import { log } from "./Utility";

const statusEffect_effects = new Map<WeaponName, WeaponEffectFunction>([
    [
        "Obliterate",
        (_aA: AttackAction) => {
            _aA.affected.statusEffects.push(new StatusEffect("bleed", 2, 0.01, _aA.from, _aA.affected));
        }
    ],
]);

export class WeaponEffect {
    attackAction: AttackAction;

    constructor(_aA: AttackAction) {
        this.attackAction = _aA;
    }

    activate() {
        log(`\tActivating ${this.attackAction.weapon.Name}`);
        const weaponEffect = statusEffect_effects.get(this.attackAction.weapon.Name);
        if (weaponEffect) {
            weaponEffect(this.attackAction);
        }

        return weaponEffect !== undefined;
    }
}