import { Stat, StatusEffectFunction, StatusEffectType } from "../typedef";
import { clamp, log } from "./Utility";

const statusEffect_effects = new Map<StatusEffectType, StatusEffectFunction>([
    [
        "bleed",
        (_statusEffect: StatusEffect) => {
            const affected = _statusEffect.affected;
            const value = _statusEffect.value * 100;
            let returnString = `**${affected.base.class}** (${affected.index}) Bleeds! 🩸 -**${value}**`;

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
]);

export class StatusEffect {
    type: StatusEffectType;
    duration: number;
    value: number;
    from: Stat;
    affected: Stat;

    constructor(_type: StatusEffectType, _duration: number, _value: number, _from: Stat, _affected: Stat) {
        this.type = _type;
        this.duration = _duration;
        this.value = clamp(_value, 0, 1);
        this.from = _from;
        this.affected = _affected;
    }

    tick() {
        log(`\t\tFinding "${this.type}" (${this.value} for ${this.duration})...`);

        let statusResult: string = "";
        const statusEffect = statusEffect_effects.get(this.type);
        if (this.duration > 0 && statusEffect) {
            log(`\t\t\tSuccessful execution!`)
            statusResult = statusEffect(this);
        }
        else {
            log(`\t\t\tFailed to execute. Removing.`)
        }
        return statusResult;
    }
}