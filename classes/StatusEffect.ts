import { Action, AttackAction, Stat, StatusEffectFunction, StatusEffectType } from "../typedef";
import { addHPBar, clamp, log, roundToDecimalPlace } from "./Utility";

const statusEffect_effects = new Map<StatusEffectType, StatusEffectFunction>([
    [
        "bleed",
        (_statusEffect: StatusEffect, _sameRound_action: Action) => {
            const affected = _statusEffect.affected;
            const value = _statusEffect.value * 100;
            let returnString = `**${affected.base.class}** (${affected.index}) Bleeds! 🩸 -**${value}** (x${_statusEffect.duration})`;

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
    [
        "protected",
        (_statusEffect: StatusEffect, _sameRound_action: Action) => {
            const affected = _statusEffect.affected;
            const value = _statusEffect.value * 100;
            let returnString = "";

            if (value > 0) {
                returnString += `**${affected.base.class}** (${affected.index}) is Protected! 🛡️ (**${roundToDecimalPlace(value)}**)`;
                if (_sameRound_action.type === "Attack") {
                    returnString += `\nProtection duration: ${_statusEffect.duration}`;
                    _statusEffect.duration--;
                }
            }

            return returnString;
        }
    ],
    [
        "labouring",
        (_statusEffect: StatusEffect, _sameRound_action: Action) => {
            const affected = _statusEffect.affected;
            const value = _statusEffect.value * 1000;
            let returnString = `**${affected.base.class}** (${affected.index}) Labours... 👷 (Damage Taken: **${roundToDecimalPlace(value)}**)`;
            _statusEffect.duration--;

            return returnString;
        }
    ],
    [
        "fury",
        (_statusEffect: StatusEffect, _sameRound_action: Action) => {
            const affected = _statusEffect.affected;
            const value = _statusEffect.value * 100;
            let returnString = `**${affected.base.class}** (${affected.index})`;

            if (value > 0.66) {
                returnString += ` is **ENRAGED**! ( ${addHPBar(100, value)} )`;
                if (affected.buffs.Damage < 5) {
                    affected.buffs.Damage = 5;
                }
            }
            else {
                returnString += ` is growing in rage... ( ${addHPBar(100, value)} )`;
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

    constructor(_type: StatusEffectType, _duration: number, _value: number, _from: Stat, _affected: Stat) {
        log(`\t\t\tConstructed new Status: ${_type}, ${_value} for ${_duration} rounds`);
        this.type = _type;
        this.duration = _duration;
        this.value = clamp(_value, 0, 1);
        this.from = _from;
        this.affected = _affected;
    }

    tick(_action: Action) {
        log(`\t\tFinding "${this.type}" (${this.value} for ${this.duration})...`);

        let statusResult: string = "";
        const statusEffect = statusEffect_effects.get(this.type);
        if (this.duration > 0 && statusEffect) {
            log(`\t\t\tSuccessful execution!`)
            statusResult = statusEffect(this, _action);
        }
        else {
            log(`\t\t\tFailed to execute. Removing.`)
        }
        return statusResult;
    }

    exit(_action: Action) {

    }
}