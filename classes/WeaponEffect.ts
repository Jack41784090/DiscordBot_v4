import { AttackAction, ClashResult, WeaponEffectFunction, WeaponName } from "../typedef";
import { Battle } from "./Battle";
import { StatusEffect } from "./StatusEffect";
import { log } from "./Utility";

const statusEffect_effects = new Map<WeaponName, WeaponEffectFunction>([
    [
        "Obliterate",
        (_aA: AttackAction, _cR: ClashResult, _bd: Battle) => {
            if (_cR.fate !== "Miss") {
                _aA.affected.statusEffects.push(new StatusEffect("bleed", 2, 0.01, _aA.from, _aA.affected));
                return "__Obliterate__ bleeds the enemy!"
            }
            return "";
        }
    ],
    [
        "Endure",
        (_aA: AttackAction, _cR: ClashResult, _bd: Battle) => {
            let returnString = "";
            const affected = _aA.affected;
            const labourStatus = _bd.getStatus(affected, "labouring");
            if (labourStatus[0]) {
                const damageTaken = labourStatus[0].value * 1000;
                returnString += _bd.heal(affected, damageTaken * 0.33);
                affected.statusEffects.push(new StatusEffect("protected", 2, damageTaken * 0.33, _aA.from, _aA.affected));
            }
            return returnString + "__Endure__: Shielded!"
        }
    ],
    [
        "Endless Labour",
        (_aA: AttackAction, _cR: ClashResult, _bd: Battle) => {
            const affected = _aA.affected;
            const previousLabour = _bd.getStatus(affected, "labouring");
            if (previousLabour[0] === undefined) {
                affected.statusEffects.push(new StatusEffect("labouring", 999, 0, affected, affected));
            }
            return "Hercules: __**Endless Labour**__"
        }
    ],
    [
        "Vicious Stab",
        (_aA: AttackAction, _cR: ClashResult, _bd: Battle) => {
            return "";
        }
    ],
    [
        "Decimate",
        (_aA: AttackAction, _cR: ClashResult, _bd: Battle) => {
            return "";
        }
    ],
    [
        "Unrelenting Fury",
        (_aA: AttackAction, _cR: ClashResult, _bd: Battle) => {
            return "";
        }
    ],
]);

export class WeaponEffect {
    attackAction: AttackAction;
    clashResult: ClashResult;
    battleData: Battle;

    constructor(_aA: AttackAction, _cR: ClashResult, _bd: Battle) {
        this.attackAction = _aA;
        this.clashResult = _cR;
        this.battleData = _bd;
    }

    activate() {
        log(`\tActivating ${this.attackAction.weapon.Name}`);
        let returnString = "";

        const weaponEffect = statusEffect_effects.get(this.attackAction.weapon.Name);
        if (weaponEffect) {
            returnString += weaponEffect(this.attackAction, this.clashResult, this.battleData);
        }

        return returnString;
    }
}