import { Action, AttackAction, Stat, StatusEffectFunction, StatusEffectType } from "../typedef";
import { Battle } from "./Battle";
import { addHPBar, clamp, arrayGetLargestInArray, log, roundToDecimalPlace } from "./Utility";

const statusEffect_effects = new Map<StatusEffectType, StatusEffectFunction>([
    [
        "bleed",
        (_statusEffect: StatusEffect, _sameRound_action: Action, _bd: Battle) => {
            const affected = _statusEffect.affected;
            const value = _statusEffect.value;
            let returnString = "";

            if (value > 0) {
                returnString += `Bleeds! 🩸 -**${roundToDecimalPlace(value)}** (x${_statusEffect.duration})`;
                affected.HP -= value;

                if (affected.HP + value > 0 && affected.HP <= 0) {
                    returnString += "\n__**KILLING BLOW!**__";
                }
                else if (affected.HP <= 0) {
                    returnString += " (*Overkill*)";
                }

                _statusEffect.duration--;
            }

            return returnString;
        }
    ],
    [
        "protected",
        (_statusEffect: StatusEffect, _sameRound_action: Action, _bd: Battle) => {
            const value = clamp(_statusEffect.value, 0, _statusEffect.affected.base.AHP); _statusEffect.value = value;
            let returnString = "";

            if (value > 0) {
                returnString += `Shielded! 🛡️ (**${roundToDecimalPlace(value)}**)`;
                if (_sameRound_action.type === "Attack") {
                    returnString += ` (x${_statusEffect.duration})`;
                    _statusEffect.duration--;
                }
            }

            return returnString;
        }
    ],
    [
        "labouring",
        (_statusEffect: StatusEffect, _sameRound_action: Action, _bd: Battle) => {
            const value = clamp(_statusEffect.value, 0, 100); _statusEffect.value = value;
            let returnString = `Endures the pain... 👷 (**${roundToDecimalPlace(value)}**)`;
            _statusEffect.duration--;

            return returnString;
        }
    ],
    [
        "fury",
        (_statusEffect: StatusEffect, _sameRound_action: Action, _bd: Battle) => {
            const affected = _statusEffect.affected;
            const value = clamp(_statusEffect.value, 0, 100); _statusEffect.value = value;
            const fullBar = 12;
            const fullFury = 100;
            let returnString = "";

            if (value > 66) {
                returnString += `**ENRAGED**! ( \`${addHPBar(fullBar, value * fullBar / fullFury)}\` )`;
                if (affected.buffs.Damage < 5) {
                    affected.buffs.Damage = 5;
                }
                if (affected.buffs.lifesteal < 0.2) {
                    affected.buffs.lifesteal = 0.2;
                }
            }
            else {
                returnString += `Growing in rage... ( \`${addHPBar(fullBar, value * fullBar / fullFury)}\` )`;
                _bd.removeBuffStatus(_statusEffect.affected, 5, "Damage");
                _bd.removeBuffStatus(_statusEffect.affected, 0.2, "lifesteal");
            }

            return returnString;
        }
    ],
    [
        "DamageUp",
        (_statusEffect: StatusEffect, _sameRound_action: Action, _bd: Battle) => {
            const value = _statusEffect.value;
            let returnString = "";

            if (value > 0) {
                returnString += `Damage Up! 💪 (**${roundToDecimalPlace(value)}**)`;
                if (_sameRound_action.type === "Attack") {
                    returnString += `(x${_statusEffect.duration})`;
                    _statusEffect.duration--;
                }
            }

            return returnString;
        }
    ],
]);

export class StatusEffect {
    type: StatusEffectType;
    duration: number;
    value: number;
    from: Stat;
    affected: Stat;
    battleData: Battle;

    constructor(_type: StatusEffectType, _duration: number, _value: number, _from: Stat, _affected: Stat, _bd: Battle) {
        log(`\t\t\tConstructed new Status: ${_type}, ${_value} for ${_duration} rounds`);
        this.type = _type;
        this.duration = _duration;
        this.from = _from;
        this.affected = _affected;
        this.value = _value;
        this.battleData = _bd;
    }

    tick(_action: Action) {
        log(`\t\tFinding "${this.type}" (${this.value} for ${this.duration})...`);

        let statusResult: string = "";
        const statusEffect = statusEffect_effects.get(this.type);
        if (this.duration > 0 && statusEffect) {
            log(`\t\t\tSuccessful execution!`)
            statusResult = statusEffect(this, _action, this.battleData);
        }
        else {
            log(`\t\t\tFailed to execute. Removing.`)
        }
        return statusResult;
    }

    exit(_action: Action) {

    }
}