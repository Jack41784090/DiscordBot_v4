import { AttackAction, ClashResult, Class, WeaponEffectFunction, WeaponName } from "../typedef";
import { Battle } from "./Battle";
import { StatusEffect } from "./StatusEffect";
import { clamp, log, roundToDecimalPlace } from "./Utility";

const statusEffect_effects = new Map<WeaponName, WeaponEffectFunction>([
    [
        "Obliterate",
        (_aA: AttackAction, _cR: ClashResult, _bd: Battle) => {
            if (_cR.fate !== "Miss" && _cR.damage > 14) {
                _aA.affected.shield--;
                return `🪓 Shield break!`
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
                const damageTaken = labourStatus[0].value;
                returnString += _bd.heal(affected, damageTaken * 0.33);
                affected.statusEffects.push(new StatusEffect("protected", 2, damageTaken * 0.33, _aA.from, _aA.affected, _bd));
                labourStatus[0].value -= damageTaken * 0.33;

                returnString += `\n__Endure__: Shielded! (**${roundToDecimalPlace(damageTaken * 0.33)}**)`;
            }
            return returnString;
        }
    ],
    [
        "Endless Labour",
        (_aA: AttackAction, _cR: ClashResult, _bd: Battle) => {
            const affected = _aA.affected;
            const previousLabour = _bd.getStatus(affected, "labouring");
            if (previousLabour[0] === undefined) {
                affected.statusEffects.push(new StatusEffect("labouring", 999, 0, affected, affected, _bd));
            }
            return "Hercules: __**Endless Labour**__"
        }
    ],
    [
        "Vicious Stab",
        (_aA: AttackAction, _cR: ClashResult, _bd: Battle) => {
            let returnString = '';
            if (_cR.fate !== "Miss") {
                const attacker = _aA.from;
                const furyStatus = _bd.getStatus(attacker, "fury")[0] || new StatusEffect("fury", 999, 0, attacker, attacker, _bd);
                if (!attacker.statusEffects.some(_s => _s === furyStatus)) {
                    attacker.statusEffects.push(furyStatus);
                }

                let addingValue = 0;
                addingValue += _cR.damage;
                if (_aA.affected.HP - _cR.damage <= 0) {
                    addingValue += 10;
                }

                returnString += `🔥 +${addingValue} Fury!`
                _aA.affected.statusEffects.push(new StatusEffect("bleed", 1, _cR.damage * (0.33 * furyStatus.value / 100), _aA.from, _aA.affected, _bd));
            }
            return returnString;
        }
    ],
    [
        "Decimate",
        (_aA: AttackAction, _cR: ClashResult, _bd: Battle) => {
            let returnString = '';
            if (_cR.fate !== "Miss") {
                const attacker = _aA.from;
                const furyStatus = _bd.getStatus(attacker, "fury")[0] || new StatusEffect("fury", 999, 0, attacker, attacker, _bd);
                if (!attacker.statusEffects.some(_s => _s === furyStatus)) {
                    attacker.statusEffects.push(furyStatus);
                }

                let addingValue = 0;
                addingValue += _cR.damage;
                if (_aA.affected.HP - _cR.damage <= 0) {
                    addingValue += 10;
                }

                returnString += `🔥 +${addingValue} Fury!`
                _aA.affected.statusEffects.push(new StatusEffect("bleed", 1, _cR.damage * (0.25 * furyStatus.value / 100), _aA.from, _aA.affected, _bd));
            }
            return returnString;
        }
    ],
    [
        "Unrelenting Fury",
        (_aA: AttackAction, _cR: ClashResult, _bd: Battle) => {
            // initialise fury status
            const attacker = _aA.from;
            const furyStatus = _bd.getStatus(attacker, "fury")[0] || new StatusEffect("fury", 999, 0, attacker, attacker, _bd);
            if (!attacker.statusEffects.some(_s => _s === furyStatus)) {
                attacker.statusEffects.push(furyStatus);
            }

            // decrease fury
            if (_aA.from.base.class === _aA.affected.base.class && _aA.from.index === _aA.affected.index) {
                furyStatus.value -= 5;
            }
            clamp(furyStatus.value, 0, 100);
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