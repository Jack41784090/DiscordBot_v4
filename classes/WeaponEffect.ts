import { Action, AttackAction, ClashResult, Coordinate, Direction, EMOJI_SHIELD, EMOJI_SWORD, NumericDirection, AbilityEffectFunction, AbilityName, UniversalAbilityName } from "../typedef";
import { Battle } from "./Battle";
import { StatusEffect } from "./StatusEffect";
import { clamp, translateDirectionToMagnitudeAxis, getBaseEnemyStat, getNewObject, getStat, numericDirectionToDirection, roundToDecimalPlace } from "./Utility";

import { debug, log } from "console"

const statusEffect_effects = new Map<AbilityName | UniversalAbilityName, AbilityEffectFunction>([
    [
        "Obliterate",
        (_action: Action, _cR: ClashResult, _bd: Battle) => {
            if (_cR.fate !== "Miss" && _cR.damage > 14) {
                _action.target.shield--;
                return `🪓 Shield break!`
            }
            return "";
        }
    ],
    [
        "Endure",
        (_action: Action, _cR: ClashResult, _bd: Battle) => {
            let returnString = "";
            const affected = _action.target;
            const labourStatus = _bd.getStatus(affected, "labouring");
            if (labourStatus[0]) {
                const damageTaken = labourStatus[0].value;
                returnString += _bd.heal(affected, damageTaken * 0.33);
                affected.statusEffects.push(new StatusEffect("protected", 2, damageTaken * 0.33, _action.attacker, _action.target, _bd));
                labourStatus[0].value -= damageTaken * 0.33;

                returnString += `\n__Endure__: Shielded! (**${roundToDecimalPlace(damageTaken * 0.33)}**)`;
            }
            return returnString;
        }
    ],
    [
        "Blind Charge",
        (_action: Action, _cR: ClashResult, _bd: Battle) => {
            let returnString = '';
            const attackAction = _action as AttackAction;


            return returnString;
        }
    ],
    [
        "Passive: Endless Labour",
        (_action: Action, _cR: ClashResult, _bd: Battle) => {
            const affected = _action.attacker;
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
                const attacker = _action.attacker;
                const furyStatus = _bd.getStatus(attacker, "fury")[0] || new StatusEffect("fury", 999, 0, attacker, attacker, _bd);
                if (!attacker.statusEffects.some(_s => _s === furyStatus)) {
                    attacker.statusEffects.push(furyStatus);
                }

                let addingValue = 0;
                addingValue += _cR.damage;
                if (_action.target.HP - _cR.damage <= 0) {
                    addingValue += 10;
                }

                furyStatus.value += addingValue;
                returnString += `🔥 +${roundToDecimalPlace(addingValue)} Fury!`
                _action.target.statusEffects.push(new StatusEffect("bleed", 1, _cR.damage * (0.33 * furyStatus.value / 100), _action.attacker, _action.target, _bd));
            }
            return returnString;
        }
    ],
    [
        "Decimate",
        (_action: Action, _cR: ClashResult, _bd: Battle) => {
            let returnString = '';
            if (_cR.fate !== "Miss") {
                const attacker = _action.attacker;
                const furyStatus = _bd.getStatus(attacker, "fury")[0] || new StatusEffect("fury", 999, 0, attacker, attacker, _bd);
                if (!attacker.statusEffects.some(_s => _s === furyStatus)) {
                    attacker.statusEffects.push(furyStatus);
                }

                let addingValue = 0;
                addingValue += _cR.damage;
                if (_action.target.HP - _cR.damage <= 0) {
                    addingValue += 10;
                }

                furyStatus.value += addingValue;
                returnString += `🔥 +${roundToDecimalPlace(addingValue)} Fury!`
                _action.target.statusEffects.push(new StatusEffect("bleed", 1, _cR.damage * (0.25 * furyStatus.value / 100), _action.attacker, _action.target, _bd));
            }
            return returnString;
        }
    ],
    [
        "Passive: Unrelenting Fury",
        (_action: Action, _cR: ClashResult, _bd: Battle) => {
            // initialise fury status
            const attacker = _action.attacker;
            const furyStatus = _bd.getStatus(attacker, "fury")[0] || new StatusEffect("fury", 999, 0, attacker, attacker, _bd);
            if (!attacker.statusEffects.some(_s => _s === furyStatus)) {
                attacker.statusEffects.push(furyStatus);
            }

            // decrease fury
            if (_action.attacker.base.class === _action.target.base.class && _action.attacker.index === _action.target.index) {
                furyStatus.value -= 2;
            }
            furyStatus.value = clamp(furyStatus.value, 0, 100);
            return "";
        }
    ],
    [
        "Hunt",
        (_action: Action, _cR: ClashResult, _bd: Battle) => {
            let returnString = "";
            if (_cR.fate !== "Miss") {
                _action.target.readiness -= 3;
                returnString += "💦 Exhaust!"
            }
            return returnString;
        }
    ],
    [
        "Wild Hunt",
        (_action: Action, _cR: ClashResult, _bd: Battle) => {
            let returnString = "";

            // for (let i = 0; i < 4; i++) {
            //     const coord: Coordinate = getNewObject(_action.attacker);
            //     const numDir: NumericDirection = i;
            //     const dir: Direction = numericDirectionToDirection(numDir);
            //     const magAxis = translateDirectionToMagnitudeAxis(dir);
                
            //     coord[magAxis.axis] += magAxis.magnitude;
            //     if (_bd.findEntity_coord(coord) === undefined) {
            //         getStat(getBaseEnemyStat("Diana's Wolf")).then(wolf => {
            //             wolf.team = 'player';
            //             _bd.Spawn(wolf, coord);
            //             returnString += "🐺"
            //         })
            //     }
            // }

            return returnString;
        }
    ],
    [
        "Slay",
        (_action: Action, _cR: ClashResult, _bd: Battle) => {
            let returnString = '';
            const target = _action.target;
            if (_cR.fate !== "Miss" && (target.HP / target.base.maxHP) <= (1/3)) {
                _cR.damage = _cR.damage * 1.5;
                _cR.u_damage = _cR.u_damage * 1.5;
                returnString += 'x1.5❗❗';
            }
            return returnString;
        }
    ],
    [
        "Attack-Order",
        (_action: Action, _cR: ClashResult, _bd: Battle) => {
            let returnString = "+🗡️";
            const swords = _action.attacker.sword;
            if (swords > 0) {
                _action.target.sword++;
                _action.attacker.sword--;
                returnString += EMOJI_SWORD;
            }
            _action.target.sword++;
            return returnString;
        }
    ],
    [
        "Defence-Order",
        (_action: Action, _cR: ClashResult, _bd: Battle) => {
            let returnString = "+🛡️";
            const shields = _action.attacker.shield;
            if (shields > 0) {
                _action.target.shield++;
                _action.attacker.shield--;
                returnString += EMOJI_SHIELD;
            }
            _action.target.shield++;
            return returnString;
        }
    ],
    [
        "Manoeuvre-Order",
        (_action: Action, _cR: ClashResult, _bd: Battle) => {
            let returnString = "+👢";
            const sprints = _action.attacker.sprint;
            if (sprints > 0) {
                _action.target.sprint++;
                _action.attacker.sprint--;
                returnString += '👢'
            }
            _action.target.sprint++;
            return returnString;
        }
    ],
    [
        "Slice",
        (_action: Action, _cR: ClashResult, _bd: Battle) => {
            let returnString = "";
            const sprints = _action.attacker.sprint;
            if (sprints > 0) {
                _cR.damage += sprints;
                _cR.u_damage += sprints;
                returnString += ` (+${sprints})`
                _action.attacker.sprint--;
            }
            return returnString;
        }
    ],
    [
        "Angelic Blessings",
        (_action: Action, _cR: ClashResult, _bd: Battle) => {
            let returnString = "";
            const attacker = _action.attacker;
            const target = _action.target;
            returnString += `${target.base.class} (${target.index}): ` + _bd.heal(target, 10) + " +👢";
            returnString += `\n${attacker.base.class} (${attacker.index}): ` + _bd.heal(attacker, 10) + " +👢";
            attacker.sprint++;
            target.sprint++;
            return returnString;
        }
    ],
]);

export class AbilityEffect {
    attackAction: AttackAction;
    clashResult: ClashResult;
    battleData: Battle;

    constructor(_aA: AttackAction, _cR: ClashResult, _bd: Battle) {
        this.attackAction = _aA;
        this.clashResult = _cR;
        this.battleData = _bd;
    }

    activate() {
        log(`\tActivating ${this.attackAction.ability.abilityName}`);
        let returnString = "";

        const weaponEffect = statusEffect_effects.get(this.attackAction.ability.abilityName);
        if (weaponEffect) {
            returnString += weaponEffect(this.attackAction, this.clashResult, this.battleData);
        }

        return returnString;
    }
}