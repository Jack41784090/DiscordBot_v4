import { Action, AttackAction, ClashResult, Coordinate, Direction, EMOJI_SHIELD, EMOJI_SWORD, NumericDirection, WeaponEffectFunction, WeaponName } from "../typedef";
import { Battle } from "./Battle";
import { StatusEffect } from "./StatusEffect";
import { clamp, directionToMagnitudeAxis, getBaseEnemyStat, getNewObject, getStat, log, numericDirectionToDirection, roundToDecimalPlace } from "./Utility";

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
        "Passive: Unrelenting Fury",
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
    [
        "Hunt",
        (_action: Action, _cR: ClashResult, _bd: Battle) => {
            let returnString = "";
            if (_cR.fate !== "Miss") {
                _action.affected.readiness -= 3;
                returnString += "💦 Exhaust!"
            }
            return returnString;
        }
    ],
    [
        "Wild Hunt",
        (_action: Action, _cR: ClashResult, _bd: Battle) => {
            let returnString = "";

            for (let i = 0; i < 4; i++) {
                const coord: Coordinate = getNewObject(_action.from);
                const numDir: NumericDirection = i;
                const dir: Direction = numericDirectionToDirection(numDir);
                const magAxis = directionToMagnitudeAxis(dir);
                
                coord[magAxis.axis] += magAxis.magnitude;
                if (_bd.findEntity_coord(coord) === undefined) {
                    const wolf = getStat(getBaseEnemyStat("Diana's Wolf"));
                    wolf.team = 'player';
                    _bd.Spawn(wolf, coord);
                    returnString += "🐺"
                }
            }

            return returnString;
        }
    ],
    [
        "Slay",
        (_action: Action, _cR: ClashResult, _bd: Battle) => {
            let returnString = '';
            const target = _action.affected;
            if (_cR.fate !== "Miss" && (target.HP / target.base.AHP) <= (1/3)) {
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
            const swords = _action.from.sword;
            if (swords > 0) {
                _action.affected.sword++;
                _action.from.sword--;
                returnString += EMOJI_SWORD;
            }
            _action.affected.sword++;
            return returnString;
        }
    ],
    [
        "Defence-Order",
        (_action: Action, _cR: ClashResult, _bd: Battle) => {
            let returnString = "+🛡️";
            const shields = _action.from.shield;
            if (shields > 0) {
                _action.affected.shield++;
                _action.from.shield--;
                returnString += EMOJI_SHIELD;
            }
            _action.affected.shield++;
            return returnString;
        }
    ],
    [
        "Manoeuvre-Order",
        (_action: Action, _cR: ClashResult, _bd: Battle) => {
            let returnString = "+👢";
            const sprints = _action.from.sprint;
            if (sprints > 0) {
                _action.affected.sprint++;
                _action.from.sprint--;
                returnString += '👢'
            }
            _action.affected.sprint++;
            return returnString;
        }
    ],
    [
        "Slice",
        (_action: Action, _cR: ClashResult, _bd: Battle) => {
            let returnString = "";
            const sprints = _action.from.sprint;
            if (sprints > 0) {
                _cR.damage += sprints;
                _cR.u_damage += sprints;
                returnString += ` (+${sprints})`
                _action.from.sprint--;
            }
            return returnString;
        }
    ],
    [
        "Angelic Blessings",
        (_action: Action, _cR: ClashResult, _bd: Battle) => {
            let returnString = "";
            const attacker = _action.from;
            const target = _action.affected;
            returnString += `${target.base.class} (${target.index}): ` + _bd.heal(target, 10) + " +👢";
            returnString += `\n${attacker.base.class} (${attacker.index}): ` + _bd.heal(attacker, 10) + " +👢";
            attacker.sprint++;
            target.sprint++;
            return returnString;
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