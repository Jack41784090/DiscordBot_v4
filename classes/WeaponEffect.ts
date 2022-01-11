import { Action, AttackAction, ClashResult, Class, WeaponEffectFunction, WeaponName } from "../typedef";
import { Battle } from "./Battle";
import { StatusEffect } from "./StatusEffect";
import { clamp, log, roundToDecimalPlace } from "./Utility";

const statusEffect_effects = new Map<WeaponName, WeaponEffectFunction>([
    [
        "Obliterate",
        (_action: Action, _cR: ClashResult, _bd: Battle) => {
            if (_cR.fate !== "Miss" && _cR.damage > 14) {
                _action.affected.shield--;
                return `🪓 Shield break!`
            }
            return "";
        }
    ],
    [
        "Endure",
        (_action: Action, _cR: ClashResult, _bd: Battle) => {
            let returnString = "";
            const affected = _action.affected;
            const labourStatus = _bd.getStatus(affected, "labouring");
            if (labourStatus[0]) {
                const damageTaken = labourStatus[0].value;
                returnString += _bd.heal(affected, damageTaken * 0.33);
                affected.statusEffects.push(new StatusEffect("protected", 2, damageTaken * 0.33, _action.from, _action.affected, _bd));
                labourStatus[0].value -= damageTaken * 0.33;

                returnString += `\n__Endure__: Shielded! (**${roundToDecimalPlace(damageTaken * 0.33)}**)`;
            }
            return returnString;
        }
    ],
    [
        "Endless Labour",
        (_action: Action, _cR: ClashResult, _bd: Battle) => {
            const affected = _action.from;
            const previousLabour = _bd.getStatus(affected, "labouring");
            if (previousLabour[0] === undefined) {
                affected.statusEffects.push(new StatusEffect("labouring", 999, 0, affected, affected, _bd));
            }
            return ""
        }
    ],
    [
        "Vicious Stab",
        (_action: Action, _cR: ClashResult, _bd: Battle) => {
            let returnString = '';
            if (_cR.fate !== "Miss") {
                const attacker = _action.from;
                const furyStatus = _bd.getStatus(attacker, "fury")[0] || new StatusEffect("fury", 999, 0, attacker, attacker, _bd);
                if (!attacker.statusEffects.some(_s => _s === furyStatus)) {
                    attacker.statusEffects.push(furyStatus);
                }

                let addingValue = 0;
                addingValue += _cR.damage;
                if (_action.affected.HP - _cR.damage <= 0) {
                    addingValue += 10;
                }

                furyStatus.value += addingValue;
                returnString += `🔥 +${roundToDecimalPlace(addingValue)} Fury!`
                _action.affected.statusEffects.push(new StatusEffect("bleed", 1, _cR.damage * (0.33 * furyStatus.value / 100), _action.from, _action.affected, _bd));
            }
            return returnString;
        }
    ],
    [
        "Decimate",
        (_action: Action, _cR: ClashResult, _bd: Battle) => {
            let returnString = '';
            if (_cR.fate !== "Miss") {
                const attacker = _action.from;
                const furyStatus = _bd.getStatus(attacker, "fury")[0] || new StatusEffect("fury", 999, 0, attacker, attacker, _bd);
                if (!attacker.statusEffects.some(_s => _s === furyStatus)) {
                    attacker.statusEffects.push(furyStatus);
                }

                let addingValue = 0;
                addingValue += _cR.damage;
                if (_action.affected.HP - _cR.damage <= 0) {
                    addingValue += 10;
                }

                furyStatus.value += addingValue;
                returnString += `🔥 +${roundToDecimalPlace(addingValue)} Fury!`
                _action.affected.statusEffects.push(new StatusEffect("bleed", 1, _cR.damage * (0.25 * furyStatus.value / 100), _action.from, _action.affected, _bd));
            }
            return returnString;
        }
    ],
    [
        "Unrelenting Fury",
        (_action: Action, _cR: ClashResult, _bd: Battle) => {
            // initialise fury status
            const attacker = _action.from;
            const furyStatus = _bd.getStatus(attacker, "fury")[0] || new StatusEffect("fury", 999, 0, attacker, attacker, _bd);
            if (!attacker.statusEffects.some(_s => _s === furyStatus)) {
                attacker.statusEffects.push(furyStatus);
            }

            // decrease fury
            if (_action.from.base.class === _action.affected.base.class && _action.from.index === _action.affected.index) {
                furyStatus.value -= 2;
            }
            furyStatus.value = clamp(furyStatus.value, 0, 100);
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